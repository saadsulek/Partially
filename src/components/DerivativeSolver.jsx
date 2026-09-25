import React, { useState, useMemo } from 'react';
import { MathTex } from './FormulaCard';
import { analyzeFunction, buildStepByStepSolution } from '../utils/mathEngine';

const SOLVER_EXAMPLES = [
  { label: 'x³y - 2xy² + sin(x)', expr: 'x^3*y - 2*x*y^2 + sin(x)' },
  { label: '3x²y³ - 5xy + 4y²', expr: '3*x^2*y^3 - 5*x*y + 4*y^2' },
  { label: 'x²·cos(xy) + y³', expr: 'x^2 * cos(x*y) + y^3' },
  { label: 'ln(x² + y²)', expr: 'ln(x^2 + y^2)' }
];

const DIFF_OPERATORS = [
  { id: 'dx', tex: '\\frac{\\partial}{\\partial x}', short: '∂f/∂x' },
  { id: 'dy', tex: '\\frac{\\partial}{\\partial y}', short: '∂f/∂y' },
  { id: 'dxx', tex: '\\frac{\\partial^2}{\\partial x^2}', short: '∂²f/∂x²' },
  { id: 'dyy', tex: '\\frac{\\partial^2}{\\partial y^2}', short: '∂²f/∂y²' },
  { id: 'dxy', tex: '\\frac{\\partial^2}{\\partial x \\partial y}', short: '∂²f/∂x∂y' }
];

export default function DerivativeSolver({
  globalExpression,
  onSyncTo3D,
  x0,
  y0
}) {
  const [solverExpr, setSolverExpr] = useState('x^3*y - 2*x*y^2 + sin(x)');
  const [selectedOp, setSelectedOp] = useState('dx');

  const solverAnalysis = useMemo(() => analyzeFunction(solverExpr), [solverExpr]);
  const stepSolution = useMemo(
    () => buildStepByStepSolution(solverAnalysis, selectedOp),
    [solverAnalysis, selectedOp]
  );

  const numericAtPoint = useMemo(() => {
    if (!solverAnalysis.isValid) return 0;
    const vals = solverAnalysis.evaluateAt(x0, y0);
    if (selectedOp === 'dx') return vals.fx;
    if (selectedOp === 'dy') return vals.fy;
    if (selectedOp === 'dxx') return vals.fxx;
    if (selectedOp === 'dyy') return vals.fyy;
    if (selectedOp === 'dxy') return vals.fyx;
    return vals.fx;
  }, [solverAnalysis, selectedOp, x0, y0]);

  return (
    <section className="space-y-6">
      {/* Workspace Header Card */}
      <div className="bg-[#111b18] border border-[#23352f] rounded-xl p-5 shadow-lg shadow-black/20 space-y-4">
        <div className="flex items-center gap-2 text-xs font-label text-[#6d857d]">
          <span>Calculus III</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Step-by-Step Solver</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-semibold">Symbolic Partial Differentiation</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#e2ece9] tracking-tight">
              Symbolic Partial Derivative Step Solver
            </h1>
            <p className="text-sm text-[#9cb3ab] mt-1">
              Active independent variable highlighted in <span className="text-primary font-semibold">Spectral Mint (#52b788)</span>; held constant highlighted in <span className="text-tertiary font-semibold">Luminous Gold (#e7c268)</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSolverExpr(globalExpression)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#15221f] hover:bg-[#1b2824] text-[#e2ece9] border border-[#23352f] transition-colors"
            >
              Load 3D Surface
            </button>
            {solverAnalysis.isValid && (
              <button
                onClick={() => onSyncTo3D(solverExpr)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-[#003823] hover:bg-[#74c69d] shadow-[0_0_12px_rgba(82,183,136,0.3)] transition-all"
              >
                <span className="material-symbols-outlined text-sm">view_in_ar</span>
                Plot in 3D Visualizer
              </button>
            )}
          </div>
        </div>

        {/* Input & Operator Row */}
        <div className="pt-4 border-t border-[#23352f] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs font-bold text-primary">
                f(x,y) =
              </span>
              <input
                type="text"
                value={solverExpr}
                onChange={(e) => setSolverExpr(e.target.value)}
                placeholder="x^3*y - 2*x*y^2 + sin(x)"
                className="w-full pl-16 pr-3 py-2 rounded-lg font-mono text-xs bg-[#15221f] border border-[#23352f] text-[#e2ece9] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#6d857d] font-bold uppercase tracking-wider mr-1">
                Presets:
              </span>
              {SOLVER_EXAMPLES.map((ex) => (
                <button
                  key={ex.expr}
                  onClick={() => setSolverExpr(ex.expr)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                    solverExpr === ex.expr
                      ? 'bg-[#182b24] border-primary/40 text-primary font-semibold'
                      : 'bg-[#15221f] border-[#23352f] text-[#9cb3ab] hover:text-[#e2ece9]'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-5 gap-1.5">
            {DIFF_OPERATORS.map((op) => {
              const active = selectedOp === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => setSelectedOp(op.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                    active
                      ? 'bg-[#182b24] border-primary text-primary shadow-[0_0_10px_rgba(82,183,136,0.2)] font-semibold'
                      : 'bg-[#15221f] border-[#23352f] text-[#9cb3ab] hover:border-[#6d857d]'
                  }`}
                >
                  <MathTex tex={op.tex} />
                  <span className="text-[10px] font-mono mt-0.5">{op.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3-Step Derivation Cards */}
      {stepSolution && (
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_8px_#52b788]" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-xs font-bold rounded">
                  Step 1
                </span>
                <h3 className="font-headline font-bold text-base text-[#e2ece9]">
                  Identify Independent Variable vs. Frozen Constant
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded bg-[#182b24] border border-primary/30 text-primary">
                  Active: {stepSolution.activeVar}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#4a3b10]/50 border border-tertiary/30 text-tertiary">
                  Constant: {stepSolution.constVar}
                </span>
              </div>
            </div>

            {stepSolution.isSecondOrder && (
              <div className="p-3 rounded-lg bg-[#15221f] border border-[#23352f] text-xs text-[#9cb3ab]">
                First-order intermediate derivative:{' '}
                <MathTex tex={`${stepSolution.stage1Symbol} = ${stepSolution.stage1Tex}`} />
              </div>
            )}

            <div className="p-4 rounded-lg bg-[#15221f] border border-[#23352f] overflow-x-auto">
              <MathTex
                tex={`\\frac{\\partial}{\\partial {\\textcolor{#52b788}{${stepSolution.activeVar}}}}\\Big[\\, ${stepSolution.coloredSourceTex} \\,\\Big]`}
                block
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary shadow-[0_0_8px_#e7c268]" />
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-tertiary/20 border border-tertiary/40 text-tertiary text-xs font-bold rounded">
                Step 2
              </span>
              <h3 className="font-headline font-bold text-base text-[#e2ece9]">
                Apply Differentiation Rules Term-by-Term
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stepSolution.termSteps.map((tStep) => {
                const isZero = tStep.simplifiedDerivTex === '0';
                const formattedResult = isZero
                  ? '0'
                  : tStep.sign === '-'
                  ? `-\\left(${tStep.simplifiedDerivTex}\\right)`
                  : tStep.simplifiedDerivTex;

                return (
                  <div
                    key={tStep.index}
                    className="rounded-lg border border-[#23352f] bg-[#15221f] p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-semibold text-[#6d857d]">
                        TERM #{tStep.index}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#182b24] text-secondary border border-primary/20">
                        {tStep.rule.ruleName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#0d1513] border border-[#23352f] flex items-center gap-2 flex-wrap overflow-x-auto text-sm">
                      <MathTex
                        tex={`\\frac{\\partial}{\\partial {\\textcolor{#52b788}{${stepSolution.activeVar}}}}\\left(${
                          tStep.sign === '-' ? '-' : ''
                        }${tStep.originalColoredTex}\\right)`}
                      />
                      <span className="material-symbols-outlined text-sm text-[#6d857d]">
                        arrow_forward
                      </span>
                      <MathTex tex={formattedResult} />
                    </div>

                    <p className="text-xs text-[#9cb3ab]">{tStep.rule.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-primary/40 shadow-lg shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-[#003823] text-xs font-bold rounded">
                  Step 3
                </span>
                <h3 className="font-headline font-bold text-base text-[#e2ece9]">
                  Simplified Symbolic Derivative
                </h3>
              </div>
              <div className="p-3.5 rounded-lg bg-[#15221f] border border-[#23352f] overflow-x-auto">
                <MathTex tex={`${stepSolution.symbolTex} = ${stepSolution.finalTex}`} block />
              </div>
            </div>

            <div className="sm:w-64 p-4 rounded-lg bg-[#15221f] border border-primary/30 shrink-0">
              <div className="text-[11px] font-mono text-[#6d857d] uppercase">
                Evaluated at P({x0.toFixed(2)}, {y0.toFixed(2)})
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-primary">
                {numericAtPoint >= 0 ? `+${numericAtPoint.toFixed(4)}` : numericAtPoint.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
