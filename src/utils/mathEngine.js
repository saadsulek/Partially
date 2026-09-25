import { parse, derivative, simplify } from 'mathjs';

const ALLOWED_SYMBOLS = new Set([
  'x', 'y', 'z', 'e', 'pi', 'PI', 'E',
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot',
  'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
  'exp', 'log', 'ln', 'sqrt', 'abs', 'cbrt'
]);

/**
 * Normalize human-friendly math notation into mathjs-compatible syntax
 */
export function normalizeExpression(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return 'x^2 + y^2';
  let cleaned = rawInput.trim();
  if (!cleaned) return 'x^2 + y^2';

  if (/[;={}[\]\\'"`$@]/.test(cleaned)) {
    throw new Error('Unsupported characters in expression.');
  }
  if (cleaned.length > 120) {
    throw new Error('Expression too long (max 120 chars).');
  }

  cleaned = cleaned.replace(/\bln\s*\(/g, 'log(');
  return cleaned;
}

/**
 * Defensively parse and validate a math expression in (x, y)
 */
export function parseSafeExpression(rawInput) {
  const normalized = normalizeExpression(rawInput);
  const ast = parse(normalized);

  ast.traverse((node) => {
    const allowedNodeTypes = new Set([
      'OperatorNode',
      'ConstantNode',
      'SymbolNode',
      'FunctionNode',
      'ParenthesisNode'
    ]);

    if (!allowedNodeTypes.has(node.type)) {
      throw new Error(`Unsupported syntax: ${node.type}`);
    }
    if (node.type === 'SymbolNode' && !ALLOWED_SYMBOLS.has(node.name)) {
      throw new Error(`Unknown symbol "${node.name}". Use variables x and y.`);
    }
    if (node.type === 'FunctionNode' && !ALLOWED_SYMBOLS.has(node.fn.name)) {
      throw new Error(`Unsupported function "${node.fn.name}()".`);
    }
  });

  return { ast, normalized };
}

/**
 * Safely evaluate a compiled mathjs expression at (x, y)
 */
export function evalSafe(compiled, x, y) {
  try {
    const val = compiled.evaluate({ x, y, e: Math.E, pi: Math.PI });
    if (typeof val === 'number' && Number.isFinite(val)) {
      return Math.max(-50, Math.min(50, val));
    }
    if (val && typeof val.re === 'number' && Number.isFinite(val.re)) {
      return Math.max(-50, Math.min(50, val.re));
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Check if a mathjs AST node depends on a given variable name
 */
export function dependsOn(node, varName) {
  let found = false;
  node.traverse((child) => {
    if (child.isSymbolNode && child.name === varName) {
      found = true;
    }
  });
  return found;
}

/**
 * Convert a mathjs AST node to clean LaTeX, safely wrapping \textcolor in braces
 * so exponents like x^2 render without KaTeX grouping errors.
 */
export function nodeToLatex(node, options = {}) {
  if (!node) return '0';
  const { highlight = false, activeVar = 'x', constVar = 'y' } = options;

  try {
    let tex = node.toTex({
      parenthesis: 'auto',
      implicit: 'hide',
      handler: (n, callbacks) => {
        if (n.isFunctionNode && n.fn.name === 'log') {
          return `\\ln\\left(${n.args.map((a) => a.toTex(callbacks)).join(', ')}\\right)`;
        }
        if (highlight && n.isSymbolNode) {
          if (n.name === activeVar) {
            return `{\\textcolor{#52b788}{${n.name}}}`;
          }
          if (n.name === constVar) {
            return `{\\textcolor{#e7c268}{${n.name}}}`;
          }
        }
        return undefined;
      }
    });
    tex = tex.replace(/\\cdot/g, ' ');
    return tex;
  } catch {
    return node.toString();
  }
}

/**
 * Split top-level additive (+ / -) terms for term-by-term rule analysis
 */
export function splitAdditiveTerms(node) {
  const terms = [];

  function collect(n, sign = '+') {
    if (n.isParenthesisNode) {
      collect(n.content, sign);
      return;
    }
    if (n.isOperatorNode && n.op === '+' && n.args.length === 2) {
      collect(n.args[0], sign);
      collect(n.args[1], sign);
      return;
    }
    if (n.isOperatorNode && n.op === '-' && n.args.length === 2) {
      collect(n.args[0], sign);
      const flipped = sign === '+' ? '-' : '+';
      collect(n.args[1], flipped);
      return;
    }
    if (n.isOperatorNode && n.op === '-' && n.args.length === 1) {
      const flipped = sign === '+' ? '-' : '+';
      collect(n.args[0], flipped);
      return;
    }
    terms.push({ sign, node: n });
  }

  collect(node, '+');
  return terms;
}

/**
 * Concise calculus rule classifier for a single additive term
 */
export function classifyTermRule(termNode, activeVar, constVar) {
  const hasActive = dependsOn(termNode, activeVar);
  const hasConst = dependsOn(termNode, constVar);

  if (!hasActive) {
    if (hasConst) {
      return {
        ruleName: `Constant (${constVar} held fixed)`,
        badgeColor: 'amber',
        explanation: `No "${activeVar}" present. Since "${constVar}" is held constant, this term differentiates to 0.`
      };
    }
    return {
      ruleName: 'Constant Rule',
      badgeColor: 'slate',
      explanation: `Constant number with no "${activeVar}" dependence; derivative is 0.`
    };
  }

  if (termNode.isOperatorNode && termNode.op === '*') {
    const leftHasActive = dependsOn(termNode.args[0], activeVar);
    const rightHasActive = dependsOn(termNode.args[1], activeVar);

    if (leftHasActive && rightHasActive) {
      return {
        ruleName: 'Product Rule',
        badgeColor: 'purple',
        explanation: `Both factors depend on "${activeVar}": (u·v)' = u'v + uv'.`
      };
    }
    if (hasConst) {
      return {
        ruleName: 'Constant Multiple + Power Rule',
        badgeColor: 'cyan',
        explanation: `The "${constVar}" factor stays untouched as a constant multiplier while "${activeVar}" is differentiated.`
      };
    }
    return {
      ruleName: 'Constant Multiple Rule',
      badgeColor: 'cyan',
      explanation: `Multiply the scalar coefficient by the derivative with respect to "${activeVar}".`
    };
  }

  if (termNode.isOperatorNode && termNode.op === '/') {
    return {
      ruleName: 'Quotient Rule',
      badgeColor: 'rose',
      explanation: `Differentiate fraction with respect to "${activeVar}" while keeping "${constVar}" fixed.`
    };
  }

  if (termNode.isFunctionNode) {
    const arg = termNode.args[0];
    const isSimpleArg = arg && arg.isSymbolNode && arg.name === activeVar;
    if (!isSimpleArg && arg && dependsOn(arg, activeVar)) {
      return {
        ruleName: `Chain Rule (${termNode.fn.name})`,
        badgeColor: 'emerald',
        explanation: `Differentiate outer ${termNode.fn.name}(u) and multiply by inner partial ∂u/∂${activeVar}.`
      };
    }
    return {
      ruleName: `Standard ${termNode.fn.name}() Rule`,
      badgeColor: 'cyan',
      explanation: `Direct derivative of ${termNode.fn.name}(${activeVar}) with respect to "${activeVar}".`
    };
  }

  return {
    ruleName: 'Power Rule',
    badgeColor: 'cyan',
    explanation: `Apply d/d${activeVar}[${activeVar}ⁿ] = n·${activeVar}ⁿ⁻¹ with "${constVar}" held constant.`
  };
}

/**
 * Compute full symbolic and numerical analysis of f(x, y)
 */
export function analyzeFunction(rawExpression) {
  try {
    const { ast, normalized } = parseSafeExpression(rawExpression);
    const fCompiled = ast.compile();

    const fxNode = simplify(derivative(ast, 'x'));
    const fyNode = simplify(derivative(ast, 'y'));
    const fxxNode = simplify(derivative(fxNode, 'x'));
    const fyyNode = simplify(derivative(fyNode, 'y'));
    const fxyNode = simplify(derivative(fxNode, 'y'));
    const fyxNode = simplify(derivative(fyNode, 'x'));

    const fxCompiled = fxNode.compile();
    const fyCompiled = fyNode.compile();
    const fxxCompiled = fxxNode.compile();
    const fyyCompiled = fyyNode.compile();
    const fxyCompiled = fxyNode.compile();
    const fyxCompiled = fyxNode.compile();

    return {
      isValid: true,
      error: null,
      normalized,
      ast,
      nodes: {
        f: ast,
        fx: fxNode,
        fy: fyNode,
        fxx: fxxNode,
        fyy: fyyNode,
        fxy: fxyNode,
        fyx: fyxNode
      },
      latex: {
        f: nodeToLatex(ast),
        fHighlightX: nodeToLatex(ast, { highlight: true, activeVar: 'x', constVar: 'y' }),
        fHighlightY: nodeToLatex(ast, { highlight: true, activeVar: 'y', constVar: 'x' }),
        fx: nodeToLatex(fxNode),
        fy: nodeToLatex(fyNode),
        fxx: nodeToLatex(fxxNode),
        fyy: nodeToLatex(fyyNode),
        fxy: nodeToLatex(fxyNode),
        fyx: nodeToLatex(fyxNode)
      },
      evaluateAt: (x, y) => ({
        z: evalSafe(fCompiled, x, y),
        fx: evalSafe(fxCompiled, x, y),
        fy: evalSafe(fyCompiled, x, y),
        fxx: evalSafe(fxxCompiled, x, y),
        fyy: evalSafe(fyyCompiled, x, y),
        fxy: evalSafe(fxyCompiled, x, y),
        fyx: evalSafe(fyxCompiled, x, y)
      }),
      evalSurface: (x, y) => evalSafe(fCompiled, x, y)
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message || 'Invalid expression.',
      normalized: 'x^2 + y^2'
    };
  }
}

/**
 * Generate a clean 3-step breakdown for DerivativeSolver.jsx
 */
export function buildStepByStepSolution(analysis, diffMode) {
  if (!analysis || !analysis.isValid) return null;

  const { nodes, latex } = analysis;

  const modeConfig = {
    dx: {
      title: 'First-Order Partial w.r.t. x',
      symbolTex: '\\frac{\\partial f}{\\partial x}',
      activeVar: 'x',
      constVar: 'y',
      isSecondOrder: false,
      sourceNode: nodes.f,
      finalTex: latex.fx
    },
    dy: {
      title: 'First-Order Partial w.r.t. y',
      symbolTex: '\\frac{\\partial f}{\\partial y}',
      activeVar: 'y',
      constVar: 'x',
      isSecondOrder: false,
      sourceNode: nodes.f,
      finalTex: latex.fy
    },
    dxx: {
      title: 'Second-Order Partial ∂²f/∂x²',
      symbolTex: '\\frac{\\partial^2 f}{\\partial x^2}',
      activeVar: 'x',
      constVar: 'y',
      isSecondOrder: true,
      stage1Symbol: '\\frac{\\partial f}{\\partial x}',
      stage1Tex: latex.fx,
      sourceNode: nodes.fx,
      finalTex: latex.fxx
    },
    dyy: {
      title: 'Second-Order Partial ∂²f/∂y²',
      symbolTex: '\\frac{\\partial^2 f}{\\partial y^2}',
      activeVar: 'y',
      constVar: 'x',
      isSecondOrder: true,
      stage1Symbol: '\\frac{\\partial f}{\\partial y}',
      stage1Tex: latex.fy,
      sourceNode: nodes.fy,
      finalTex: latex.fyy
    },
    dxy: {
      title: 'Mixed Partial ∂²f/∂x∂y',
      symbolTex: '\\frac{\\partial^2 f}{\\partial x \\partial y}',
      activeVar: 'x',
      constVar: 'y',
      isSecondOrder: true,
      stage1Symbol: '\\frac{\\partial f}{\\partial y}',
      stage1Tex: latex.fy,
      sourceNode: nodes.fy,
      finalTex: latex.fyx
    }
  };

  const cfg = modeConfig[diffMode] || modeConfig.dx;
  const { activeVar, constVar, sourceNode } = cfg;

  const rawTerms = splitAdditiveTerms(sourceNode);
  const termSteps = rawTerms.map((item, idx) => {
    const rule = classifyTermRule(item.node, activeVar, constVar);
    const termDerivSimp = simplify(derivative(item.node, activeVar));

    return {
      index: idx + 1,
      sign: item.sign,
      originalColoredTex: nodeToLatex(item.node, { highlight: true, activeVar, constVar }),
      simplifiedDerivTex: nodeToLatex(termDerivSimp, { highlight: true, activeVar, constVar }),
      rule
    };
  });

  return {
    ...cfg,
    coloredSourceTex: nodeToLatex(sourceNode, { highlight: true, activeVar, constVar }),
    termSteps
  };
}

export const SURFACE_PRESETS = [
  {
    id: 'wave',
    name: 'Multivariable Wave',
    label: 'z = x³y - 2xy² + sin(x)',
    expr: 'x^3*y - 2*x*y^2 + sin(x)'
  },
  {
    id: 'paraboloid',
    name: 'Elliptic Paraboloid',
    label: 'z = x² + y²',
    expr: 'x^2 + y^2'
  },
  {
    id: 'saddle',
    name: 'Hyperbolic Paraboloid',
    label: 'z = x² - y²',
    expr: 'x^2 - y^2'
  },
  {
    id: 'monkey',
    name: 'Monkey Saddle',
    label: 'z = x³ - 3xy²',
    expr: 'x^3 - 3*x*y^2'
  },
  {
    id: 'ripple',
    name: 'Standing Ripple',
    label: 'z = sin(x)cos(y)',
    expr: 'sin(x) * cos(y)'
  }
];

export function evalSafe3D(compiled, x, y, z) {
  try {
    const val = compiled.evaluate({ x, y, z, e: Math.E, pi: Math.PI });
    if (typeof val === 'number' && Number.isFinite(val)) {
      return Math.max(-100, Math.min(100, val));
    }
    return 0;
  } catch {
    return 0;
  }
}

export const VECTOR_FIELD_PRESETS = [
  {
    id: 'vortex',
    name: 'Rigid Vortex',
    label: 'F = ⟨-y, x, 0⟩',
    P: '-y',
    Q: 'x',
    R: '0',
    desc: 'Pure counterclockwise rotation in the xy-plane with constant vorticity curl F = ⟨0, 0, 2⟩.'
  },
  {
    id: 'helical',
    name: '3D Swirling Flow',
    label: 'F = ⟨yz, -xz, xy⟩',
    P: 'y*z',
    Q: '-x*z',
    R: 'x*y',
    desc: 'Coupled 3D rotational field where all 6 cross-partial derivatives interact.'
  },
  {
    id: 'conservative',
    name: 'Conservative Field',
    label: 'F = ⟨2xy, x²+z², 2yz⟩',
    P: '2*x*y',
    Q: 'x^2 + z^2',
    R: '2*y*z',
    desc: 'Gradient field F = ∇(x²y + yz²) whose curl is identically zero (∇ × F = ⟨0, 0, 0⟩).'
  },
  {
    id: 'shear',
    name: 'Boundary Shear',
    label: 'F = ⟨y², 2xz, -z²⟩',
    P: 'y^2',
    Q: '2*x*z',
    R: '-z^2',
    desc: 'Non-uniform fluid shear producing vorticity along both the x and z axes.'
  }
];

/**
 * Symbolically and numerically solve Curl(F) = ∇ × F for F = <P(x,y,z), Q(x,y,z), R(x,y,z)>
 */
export function analyzeVectorField(rawP, rawQ, rawR) {
  try {
    const { ast: nodeP } = parseSafeExpression(rawP || '0');
    const { ast: nodeQ } = parseSafeExpression(rawQ || '0');
    const { ast: nodeR } = parseSafeExpression(rawR || '0');

    // Six cross-partial derivatives required for ∇ × F
    const dR_dy = simplify(derivative(nodeR, 'y'));
    const dQ_dz = simplify(derivative(nodeQ, 'z'));

    const dP_dz = simplify(derivative(nodeP, 'z'));
    const dR_dx = simplify(derivative(nodeR, 'x'));

    const dQ_dx = simplify(derivative(nodeQ, 'x'));
    const dP_dy = simplify(derivative(nodeP, 'y'));

    // Curl components:
    // Cx = ∂R/∂y - ∂Q/∂z
    // Cy = ∂P/∂z - ∂R/∂x  (or -(∂R/∂x - ∂P/∂z))
    // Cz = ∂Q/∂x - ∂P/∂y
    const curlXNode = simplify(`(${dR_dy.toString()}) - (${dQ_dz.toString()})`);
    const curlYNode = simplify(`(${dP_dz.toString()}) - (${dR_dx.toString()})`);
    const curlZNode = simplify(`(${dQ_dx.toString()}) - (${dP_dy.toString()})`);

    const compP = nodeP.compile();
    const compQ = nodeQ.compile();
    const compR = nodeR.compile();
    const compCx = curlXNode.compile();
    const compCy = curlYNode.compile();
    const compCz = curlZNode.compile();

    const isZero =
      curlXNode.toString() === '0' &&
      curlYNode.toString() === '0' &&
      curlZNode.toString() === '0';

    return {
      isValid: true,
      error: null,
      isConservative: isZero,
      latex: {
        P: nodeToLatex(nodeP),
        Q: nodeToLatex(nodeQ),
        R: nodeToLatex(nodeR),
        // Highlighted source components for each partial derivative
        R_for_y: nodeToLatex(nodeR, { highlight: true, activeVar: 'y', constVar: 'z' }),
        Q_for_z: nodeToLatex(nodeQ, { highlight: true, activeVar: 'z', constVar: 'y' }),
        P_for_z: nodeToLatex(nodeP, { highlight: true, activeVar: 'z', constVar: 'x' }),
        R_for_x: nodeToLatex(nodeR, { highlight: true, activeVar: 'x', constVar: 'z' }),
        Q_for_x: nodeToLatex(nodeQ, { highlight: true, activeVar: 'x', constVar: 'y' }),
        P_for_y: nodeToLatex(nodeP, { highlight: true, activeVar: 'y', constVar: 'x' }),
        // Partial derivatives
        dR_dy: nodeToLatex(dR_dy),
        dQ_dz: nodeToLatex(dQ_dz),
        dP_dz: nodeToLatex(dP_dz),
        dR_dx: nodeToLatex(dR_dx),
        dQ_dx: nodeToLatex(dQ_dx),
        dP_dy: nodeToLatex(dP_dy),
        // Final simplified Curl components
        curlX: nodeToLatex(curlXNode),
        curlY: nodeToLatex(curlYNode),
        curlZ: nodeToLatex(curlZNode)
      },
      evaluateAt: (x, y, z = 1) => {
        const fx = evalSafe3D(compP, x, y, z);
        const fy = evalSafe3D(compQ, x, y, z);
        const fz = evalSafe3D(compR, x, y, z);
        const cx = evalSafe3D(compCx, x, y, z);
        const cy = evalSafe3D(compCy, x, y, z);
        const cz = evalSafe3D(compCz, x, y, z);
        const mag = Math.hypot(cx, cy, cz);
        return { fx, fy, fz, cx, cy, cz, mag };
      }
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message || 'Invalid vector field component.'
    };
  }
}

