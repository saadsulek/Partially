import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SurfaceViewer from './components/SurfaceViewer';
import DerivativeSolver from './components/DerivativeSolver';
import ConceptPlayground from './components/ConceptPlayground';
import CurlSolver from './components/CurlSolver';
import QuizModule from './components/QuizModule';
import PromoVideoShowcase from './components/PromoVideoShowcase';
import FormulaCard from './components/FormulaCard';
import { analyzeFunction } from './utils/mathEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('moduleA');

  const [expression, setExpression] = useState('x^3*y - 2*x*y^2 + sin(x)');
  const [x0, setX0] = useState(1.2);
  const [y0, setY0] = useState(0.8);

  const analysis = useMemo(() => analyzeFunction(expression), [expression]);

  const navItems = [
    { id: 'moduleA', label: '3D Slicing Visualizer', code: '01', shortcut: '1' },
    { id: 'moduleB', label: 'Symbolic Step Solver', code: '02', shortcut: '2' },
    { id: 'curl', label: 'Vector Field Curl (∇×F)', code: '03', shortcut: '3' },
    { id: 'moduleC', label: 'Clairaut & Gradient', code: '04', shortcut: '4' },
    { id: 'moduleD', label: 'Diagnostic Quiz', code: '05', shortcut: '5' },
    { id: 'promo', label: 'Concept Explainer (20s)', code: '06', shortcut: '6' },
  ];

  // Quick keyboard shortcuts [1 - 6] for power users
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 6) {
        setActiveTab(navItems[keyNum - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSyncTo3D = (newExpr) => {
    setExpression(newExpr);
    setActiveTab('moduleA');
  };

  const handleResetCoordinates = () => {
    setX0(0.0);
    setY0(0.0);
  };

  return (
    <div className="bg-canvas text-zinc-200 font-sans min-h-screen flex flex-col selection:bg-brand selection:text-white">
      {/* ================= ARCHITECTURAL TOP UTILITY BAR ================= */}
      <header className="h-11 border-b border-border bg-canvas px-4 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left: Brand Identity & Active Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('moduleA')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-5 h-5 rounded bg-brand flex items-center justify-center text-white font-mono font-bold text-xs tracking-tight shadow-xs">
              ∂
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-100 uppercase">
              Partially <span className="text-zinc-600 font-normal">/</span> <span className="text-brand-text">∂/∂x</span>
            </span>
          </button>

          <div className="h-3.5 w-px bg-border hidden sm:block" />

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-600">SYS:</span>
            <span className="text-emerald-500 font-medium">READY</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">MATHJS v14</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">THREE.JS r170</span>
          </div>
        </div>

        {/* Right: Concrete Utility Actions & Coordinate Readout */}
        <div className="flex items-center gap-2">
          {/* Active Evaluation Point indicator */}
          <div className="flex items-center gap-2 px-2.5 py-0.5 text-[11px] font-mono bg-surface-sunken border border-border rounded">
            <span className="text-zinc-500 font-semibold">P₀</span>
            <span className="text-sky-400">x₀={x0.toFixed(2)}</span>
            <span className="text-zinc-600">,</span>
            <span className="text-amber-400">y₀={y0.toFixed(2)}</span>
          </div>

          <button
            onClick={handleResetCoordinates}
            title="Reset evaluation point to origin (0, 0)"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-surface border border-border hover:border-zinc-700 hover:text-zinc-200 rounded transition-colors"
          >
            <span>Reset P₀</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'reference' ? 'moduleA' : 'reference')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono rounded border transition-colors ${
              activeTab === 'reference'
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-zinc-300 border-border hover:border-zinc-700 hover:text-zinc-100'
            }`}
          >
            <span>REFERENCE</span>
          </button>
        </div>
      </header>

      {/* ================= WORKSPACE NAVIGATION TABS WITH SMOOTH SLIDER ================= */}
      <nav className="h-10 border-b border-border bg-surface-sunken px-4 flex items-center justify-between overflow-x-auto shrink-0 select-none z-20 scrollbar-none">
        <div className="flex items-center gap-1 shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1 text-xs font-mono rounded transition-colors duration-150 shrink-0 ${
                  isActive
                    ? 'text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWorkspaceTab"
                    className="absolute inset-0 bg-surface-raised border border-border rounded shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={`text-[10px] ${isActive ? 'text-brand-text font-bold' : 'text-zinc-600'}`}>
                    {item.code}
                  </span>
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-zinc-600 pl-4">
          <span>SHORTCUTS: [1–6]</span>
        </div>
      </nav>

      {/* ================= MAIN APPLICATION WORKSPACE ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* Primary Content Panes with Framer Motion Transition */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-canvas flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 max-w-7xl mx-auto w-full"
            >
              {activeTab === 'moduleA' && (
                <SurfaceViewer
                  expression={expression}
                  onExpressionChange={setExpression}
                  analysis={analysis}
                  x0={x0}
                  setX0={setX0}
                  y0={y0}
                  setY0={setY0}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'moduleB' && (
                <DerivativeSolver
                  globalExpression={expression}
                  onSyncTo3D={handleSyncTo3D}
                  x0={x0}
                  y0={y0}
                />
              )}

              {activeTab === 'curl' && (
                <CurlSolver
                  x0={x0}
                  setX0={setX0}
                  y0={y0}
                  setY0={setY0}
                />
              )}

              {activeTab === 'moduleC' && (
                <ConceptPlayground
                  analysis={analysis}
                  x0={x0}
                  setX0={setX0}
                  y0={y0}
                  setY0={setY0}
                />
              )}

              {activeTab === 'moduleD' && <QuizModule />}

              {activeTab === 'promo' && <PromoVideoShowcase onNavigateTab={setActiveTab} />}

            {activeTab === 'reference' && (
              <section className="space-y-4">
                <div className="border border-border bg-surface p-4 rounded-md">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    CANONICAL IDENTITIES & FORMULATIONS
                  </div>
                  <h1 className="font-serif text-xl font-bold text-zinc-100 mt-1">
                    Multivariable Differential Operators
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Mathematical formulations for directional variation, linear tangent planes, and rotational vorticity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormulaCard
                    title="Partial Derivative with respect to x"
                    subtitle="Constraint: y = y₀ = const."
                    badge="First-Order"
                    badgeType="x"
                    tex="f_x(x_0, y_0) = \lim_{h \to 0} \frac{f(x_0 + h, y_0) - f(x_0, y_0)}{h}"
                    explanation="Measures the instantaneous rate of change of height z along the directional tangent vector Tₓ = ⟨1, 0, fₓ⟩."
                  />
                  <FormulaCard
                    title="Partial Derivative with respect to y"
                    subtitle="Constraint: x = x₀ = const."
                    badge="First-Order"
                    badgeType="y"
                    tex="f_y(x_0, y_0) = \lim_{k \to 0} \frac{f(x_0, y_0 + k) - f(x_0, y_0)}{k}"
                    explanation="Measures the instantaneous rate of change of height z along the orthogonal directional tangent vector Tᵧ = ⟨0, 1, fᵧ⟩."
                  />
                  <FormulaCard
                    title="First-Order Linear Tangent Plane"
                    subtitle="Taylor Expansion Degree 1"
                    badge="Linearization"
                    badgeType="primary"
                    tex="z - z_0 = f_x(x_0,y_0)(x - x_0) + f_y(x_0,y_0)(y - y_0)"
                    explanation="Unique 2D affine hyperplane approximating surface z = f(x, y) near P₀. Normal vector is given by n = ⟨fₓ, fᵧ, -1⟩."
                  />
                  <FormulaCard
                    title="Curl Operator (∇ × F)"
                    subtitle="Cartesian Vorticity Vector"
                    badge="Vector Calc"
                    badgeType="default"
                    tex="\nabla \times \vec{F} = \left(\frac{\partial R}{\partial y} - \frac{\partial Q}{\partial z}\right)\hat{i} + \left(\frac{\partial P}{\partial z} - \frac{\partial R}{\partial x}\right)\hat{j} + \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)\hat{k}"
                    explanation="Calculates the local microscopic angular velocity field. If ∇ × F = 0 in a simply-connected domain, F is conservative."
                  />
                </div>
              </section>
            )}
            </motion.div>
          </AnimatePresence>

          {/* Architectural System Footer */}
          <footer className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
            <div>
              <span>PARTIALLY</span> // <span>MULTIVARIABLE CALCULUS SUITE</span>
            </div>
            <div className="flex items-center gap-3">
              <span>CANVAS: THREE.JS R170</span>
              <span>•</span>
              <span>CAS: MATHJS 14.0</span>
              <span>•</span>
              <span>MATH: KATEX 0.16</span>
              <span>•</span>
              <span>ANIMATION: FRAMER-MOTION</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
