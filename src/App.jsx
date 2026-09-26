import React, { useState, useMemo } from 'react';
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
    { id: 'moduleA', label: '3D Slicing Visualizer', code: '01', shortcut: '⌘1' },
    { id: 'moduleB', label: 'Symbolic Step Solver', code: '02', shortcut: '⌘2' },
    { id: 'curl', label: 'Vector Field Curl (∇×F)', code: '03', shortcut: '⌘3' },
    { id: 'moduleC', label: 'Clairaut & Gradient', code: '04', shortcut: '⌘4' },
    { id: 'moduleD', label: 'Diagnostic Quiz', code: '05', shortcut: '⌘5' },
    { id: 'promo', label: 'Concept Explainer (20s)', code: '06', shortcut: '⌘6' },
  ];

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
      <header className="h-12 border-b border-border bg-canvas px-4 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left: Brand Identity & Active Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('moduleA')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center text-white font-mono font-bold text-xs tracking-tight shadow-xs">
              ∂
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-100 uppercase">
              Partially <span className="text-zinc-500 font-normal">/</span> <span className="text-brand-text">∂/∂x</span>
            </span>
          </button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-600">SYS:</span>
            <span className="text-emerald-500">READY</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">MATHJS v14</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">THREE.JS r170</span>
          </div>
        </div>

        {/* Center: Segmented Navigation Bar (Medium+ Screens) */}
        <nav className="hidden xl:flex items-center p-0.5 bg-surface-sunken border border-border rounded">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-xs font-mono transition-colors rounded-sm ${
                  isActive
                    ? 'bg-surface-raised text-zinc-100 font-semibold shadow-xs border border-border'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface/50'
                }`}
              >
                <span className="text-zinc-600 mr-1.5">{item.code}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Concrete Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCoordinates}
            title="Reset evaluation point to origin (0, 0)"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-zinc-400 bg-surface border border-border hover:border-border-strong hover:text-zinc-200 rounded transition-colors"
          >
            <span>P₀(0, 0)</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'reference' ? 'moduleA' : 'reference')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded border transition-colors ${
              activeTab === 'reference'
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-zinc-300 border-border hover:border-border-strong hover:text-zinc-100'
            }`}
          >
            <span>REFERENCE</span>
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Module Switcher */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 bg-surface-sunken border-b border-border shrink-0">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded shrink-0 border transition-colors ${
                isActive
                  ? 'bg-surface-raised text-zinc-100 font-semibold border-border'
                  : 'text-zinc-400 border-transparent hover:border-border'
              }`}
            >
              <span className="text-zinc-600 mr-1">{item.code}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ================= MAIN APPLICATION WORKSPACE ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* Architectural Left Index Column */}
        <aside className="hidden lg:flex w-64 border-r border-border bg-surface-sunken flex-col justify-between shrink-0 select-none">
          <div>
            {/* Section 01: Core Workspaces */}
            <div className="px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-border/80 flex items-center justify-between">
              <span>WORKSPACES</span>
              <span>INDEX</span>
            </div>

            <nav className="divide-y divide-border/40">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono text-left transition-colors ${
                      isActive
                        ? 'bg-surface text-zinc-100 font-semibold border-l-2 border-brand'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">{item.code}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">{item.shortcut}</span>
                  </button>
                );
              })}
            </nav>

            {/* Section 02: Active Evaluation Point Readout */}
            <div className="p-3.5 mt-3 mx-2.5 bg-surface border border-border rounded">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
                <span>EVALUATION COORDINATES</span>
                <span className="text-zinc-600">P₀</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                  <span className="text-sky-400 block text-[10px]">X₀ COORD</span>
                  <span className="text-zinc-200 font-bold">{x0.toFixed(2)}</span>
                </div>
                <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                  <span className="text-amber-400 block text-[10px]">Y₀ COORD</span>
                  <span className="text-zinc-200 font-bold">{y0.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer: System Status */}
          <div className="p-3.5 border-t border-border bg-surface-sunken text-[11px] font-mono text-zinc-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>CAS ENGINE</span>
              <span className="text-zinc-300">SYMBOLIC</span>
            </div>
            <div className="flex items-center justify-between">
              <span>RENDER BUFFER</span>
              <span className="text-zinc-300">WEBGL 2.0</span>
            </div>
          </div>
        </aside>

        {/* Primary Content Panes */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-canvas flex flex-col justify-between">
          <div className="space-y-6 max-w-7xl mx-auto w-full">
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
          </div>

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
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
