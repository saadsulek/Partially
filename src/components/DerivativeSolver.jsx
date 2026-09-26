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
  { id: 'dx', tex: '\\frac{\\partial}{\\partial x}', short: '∂f/∂x', desc: 'Hold y constant' },
  { id: 'dy', tex: '\\frac{\\partial}{\\partial y}', short: '∂f/∂y', desc: 'Hold x constant' },
  { id: 'dxx', tex: '\\frac{\\partial^2}{\\partial x^2}', short: '∂²f/∂x²', desc: 'Second x-derivative' },
  { id: 'dyy', tex: '\\frac{\\partial^2}{\\partial y^2}', short: '∂²f/∂y²', desc: 'Second y-derivative' },
  { id: 'dxy', tex: '\\frac{\\partial^2}{\\partial x \\partial y}', short: '∂²f/∂x∂y', desc: 'Mixed partial' }
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
    <section className="space-y-4">
      {/* Header & Function Input Utility Bar */}
      <div className="border border-border bg-surface p-4 rounded-md shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
              MODULE 02 // SYMBOLIC CALCULUS ENGINE
            </div>
            <h1 className="font-serif text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
              Step-by-Step Symbolic Differentiation Ledger
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSolverExpr(globalExpression)}
              className="px-2.5 py-1 text-xs font-mono bg-surface-sunken hover:bg-zinc-800 text-zinc-300 border border-border rounded transition-colors"
            >
              LOAD FROM 3D
            </button>
            {solverAnalysis.isValid && (
              <button
                onClick={() => onSyncTo3D(solverExpr)}
                className="px-3 py-1 text-xs font-mono font-semibold bg-brand text-white hover:bg-brand-hover rounded transition-colors"
              >
                SYNC TO 3D
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-brand-text shrink-0">f(x, y) =</span>
          <input
            type="text"
            value={solverExpr}
            onChange={(e) => setSolverExpr(e.target.value)}
            placeholder="3*x^2*y^3 - 5*x*y + 4*y^2"
            className="w-full bg-surface-sunken border border-border rounded px-3 py-1.5 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Preset Quick Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            EXAMPLES:
          </span>
          {SOLVER_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setSolverExpr(ex.expr)}
              className="px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-surface-sunken hover:bg-zinc-800 hover:text-zinc-200 border border-border rounded transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operator Segmented Toolbar & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Operator Selector (8 cols) */}
        <div className="lg:col-span-8 border border-border bg-surface p-3.5 rounded-md shadow-xs space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            DIFFERENTIAL OPERATOR TARGET
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DIFF_OPERATORS.map((op) => {
              const isSelected = selectedOp === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => setSelectedOp(op.id)}
                  className={`p-2.5 rounded border text-left font-mono transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'bg-surface-raised border-brand text-zinc-100 ring-1 ring-brand'
                      : 'bg-surface-sunken border-border text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="font-bold text-xs block mb-1">{op.short}</span>
                  <span className="text-[10px] text-zinc-500 block leading-tight">{op.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Numerical Evaluation at P0 (4 cols) */}
        <div className="lg:col-span-4 border border-border bg-surface p-3.5 rounded-md shadow-xs flex flex-col justify-between space-y-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1 flex items-center justify-between">
              <span>VALUE AT P₀({x0.toFixed(2)}, {y0.toFixed(2)})</span>
              <span className="text-zinc-600">FLOAT64</span>
            </div>
            <div className="text-2xl font-mono font-bold text-zinc-100">
              {numericAtPoint >= 0 ? `+${numericAtPoint.toFixed(4)}` : numericAtPoint.toFixed(4)}
            </div>
          </div>
          <div className="pt-2 border-t border-border-subtle text-[11px] font-mono text-zinc-400">
            Slope magnitude along chosen directional cut
          </div>
        </div>
      </div>

      {/* Main Step-by-Step Derivation Breakdown */}
      {stepSolution && (
        <div className="space-y-4">
          {/* Step 1: Variable Identification */}
          <div className="border border-border bg-surface rounded-md shadow-xs p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-surface-sunken border border-border rounded text-brand-text font-bold">
                  STEP 01
                </span>
                <h3 className="font-serif text-sm font-semibold text-zinc-100">
                  Identify Active Variable vs. Frozen Constant
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded border border-sky-900/60 bg-sky-950/30 text-sky-400">
                  Active: {stepSolution.activeVar}
                </span>
                <span className="px-2 py-0.5 rounded border border-amber-900/60 bg-amber-950/30 text-amber-400">
                  Constant: {stepSolution.constVar}
                </span>
              </div>
            </div>

            {stepSolution.isSecondOrder && (
              <div className="p-2.5 rounded bg-surface-sunken border border-border-subtle text-xs font-mono text-zinc-300">
                Intermediate first-order derivative:{' '}
                <MathTex tex={`${stepSolution.stage1Symbol} = ${stepSolution.stage1Tex}`} />
              </div>
            )}

            <div className="p-3 bg-surface-sunken border border-border-subtle rounded overflow-x-auto text-xs font-mono text-zinc-100">
              <MathTex
                tex={`\\frac{\\partial}{\\partial {\\textcolor{#38bdf8}{${stepSolution.activeVar}}}}\\Big[\\, ${stepSolution.coloredSourceTex} \\,\\Big]`}
                block
              />
            </div>
          </div>

          {/* Step 2: Term-by-Term Differentiation Table */}
          <div className="border border-border bg-surface rounded-md shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-surface-sunken flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase px-1.5 py-0.5 bg-surface border border-border rounded text-brand-text font-bold">
                  STEP 02
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                  APPLY DIFFERENTIATION RULES TERM-BY-TERM
                </span>
              </div>
              <span className="text-zinc-500">
                {stepSolution.termSteps?.length || 0} ADDITIVE TERMS
              </span>
            </div>

            <div className="divide-y divide-border">
              {stepSolution.termSteps?.map((tStep) => {
                const isZero = tStep.simplifiedDerivTex === '0';
                const formattedResult = isZero
                  ? '0'
                  : tStep.sign === '-'
                  ? `-\\left(${tStep.simplifiedDerivTex}\\right)`
                  : tStep.simplifiedDerivTex;

                return (
                  <div
                    key={tStep.index}
                    className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start hover:bg-surface-raised/40 transition-colors"
                  >
                    <div className="lg:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-500">
                          TERM {String(tStep.index).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-surface-sunken border border-border rounded text-brand-text">
                          {tStep.rule?.ruleName || 'TRANSFORMATION'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 leading-tight">
                        {tStep.rule?.explanation}
                      </div>
                    </div>

                    <div className="lg:col-span-9 bg-surface-sunken border border-border-subtle p-2.5 rounded overflow-x-auto text-xs font-mono text-zinc-100 flex items-center gap-3">
                      <MathTex
                        tex={`\\frac{\\partial}{\\partial {\\textcolor{#38bdf8}{${stepSolution.activeVar}}}}\\left(${
                          tStep.sign === '-' ? '-' : ''
                        }${tStep.originalColoredTex}\\right)`}
                      />
                      <span className="text-zinc-500 font-bold">→</span>
                      <MathTex tex={formattedResult} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Final Simplified Symbolic Result */}
          <div className="border border-border bg-surface p-4 rounded-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-brand text-white font-bold rounded">
                  STEP 03
                </span>
                <h3 className="font-serif text-sm font-semibold text-zinc-100">
                  Simplified Symbolic Derivative
                </h3>
              </div>
              <div className="p-3 rounded bg-surface-sunken border border-border-subtle overflow-x-auto text-sm font-mono text-zinc-100">
                <MathTex tex={`${stepSolution.symbolTex} = ${stepSolution.finalTex}`} block />
              </div>
            </div>

            <div className="sm:w-60 p-3.5 rounded bg-surface-sunken border border-border shrink-0 font-mono">
              <div className="text-[10px] uppercase text-zinc-500">
                VALUE AT P₀({x0.toFixed(2)}, {y0.toFixed(2)})
              </div>
              <div className="mt-1 text-2xl font-bold text-brand-text">
                {numericAtPoint >= 0 ? `+${numericAtPoint.toFixed(4)}` : numericAtPoint.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Second-Order Hessian Matrix Grid */}
      <div className="border border-border bg-surface p-4 rounded-md shadow-xs space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          SECOND-ORDER MATRIX FORMULATION // HESSIAN H(f)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="border border-border bg-surface-sunken p-3 rounded">
            <span className="text-zinc-500 block text-[10px] uppercase">∂²f / ∂x²</span>
            <div className="my-1.5 text-zinc-200 overflow-x-auto">
              <MathTex tex={solverAnalysis.isValid ? solverAnalysis.latex.fxx : '0'} />
            </div>
            <span className="text-[10px] text-zinc-500">Pure X concavity</span>
          </div>

          <div className="border border-border bg-surface-sunken p-3 rounded">
            <span className="text-zinc-500 block text-[10px] uppercase">∂²f / ∂y²</span>
            <div className="my-1.5 text-zinc-200 overflow-x-auto">
              <MathTex tex={solverAnalysis.isValid ? solverAnalysis.latex.fyy : '0'} />
            </div>
            <span className="text-[10px] text-zinc-500">Pure Y concavity</span>
          </div>

          <div className="border border-border bg-surface-sunken p-3 rounded">
            <span className="text-zinc-500 block text-[10px] uppercase">∂²f / ∂y∂x</span>
            <div className="my-1.5 text-zinc-200 overflow-x-auto">
              <MathTex tex={solverAnalysis.isValid ? solverAnalysis.latex.fxy : '0'} />
            </div>
            <span className="text-[10px] text-emerald-400">Mixed cross-partial</span>
          </div>

          <div className="border border-border bg-surface-sunken p-3 rounded">
            <span className="text-zinc-500 block text-[10px] uppercase">∂²f / ∂x∂y</span>
            <div className="my-1.5 text-zinc-200 overflow-x-auto">
              <MathTex tex={solverAnalysis.isValid ? solverAnalysis.latex.fyx : '0'} />
            </div>
            <span className="text-[10px] text-emerald-400">Identical (Clairaut)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
