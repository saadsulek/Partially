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
  const [activeTab, setActiveTab] = useState('promo');

  const [expression, setExpression] = useState('x^3*y - 2*x*y^2 + sin(x)');
  const [x0, setX0] = useState(1.2);
  const [y0, setY0] = useState(0.8);

  const analysis = useMemo(() => analyzeFunction(expression), [expression]);

  const topNavLinks = [
    { id: 'promo', label: '🎬 Concept Video' },
    { id: 'moduleA', label: '3D Visualizer' },
    { id: 'moduleB', label: 'Step Solver' },
    { id: 'curl', label: 'Curl (∇ × F)' },
    { id: 'moduleC', label: 'Clairaut & Gradient' },
    { id: 'moduleD', label: 'Practice Modules' }
  ];

  const sideNavItems = [
    { id: 'promo', label: 'Concept Video Guide', icon: 'movie' },
    { id: 'moduleA', label: 'Visualizer 3D', icon: 'view_in_ar' },
    { id: 'moduleB', label: 'Partial Step Solver', icon: 'calculate' },
    { id: 'curl', label: 'Curl Vector Field (∇×F)', icon: 'cyclone' },
    { id: 'moduleC', label: 'Gradient & Clairaut', icon: 'insights' },
    { id: 'moduleD', label: 'Practice Diagnostic', icon: 'quiz' }
  ];

  const handleSyncTo3D = (newExpr) => {
    setExpression(newExpr);
    setActiveTab('moduleA');
  };

  return (
    <div className="bg-[#0d1513] text-[#e2ece9] font-body antialiased selection:bg-primary/30 selection:text-primary flex flex-col min-h-screen">
      {/* ================= TOP NAV BAR ================= */}
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-3 bg-[#0d1513]/90 backdrop-blur-md shadow-lg shadow-black/40 border-b border-[#23352f]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('moduleA')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-headline font-bold text-lg shadow-[0_0_12px_rgba(82,183,136,0.25)]">
              ∂
            </div>
            <span className="font-headline text-xl font-bold tracking-tight text-[#e2ece9]">
              Partially <span className="text-primary font-mono font-medium">∂/∂x</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-label font-medium tracking-wide">
            {topNavLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={
                    isActive
                      ? 'border-b-2 border-primary text-primary font-semibold pb-1 drop-shadow-[0_0_6px_rgba(82,183,136,0.3)]'
                      : 'text-[#9cb3ab] font-medium hover:text-[#e2ece9] pb-1 transition-colors'
                  }
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#15221f] border border-primary/30 text-[11px] font-mono text-primary shadow-[0_0_8px_rgba(82,183,136,0.15)]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Night Session • 3200K Low Blue</span>
          </div>

          <button
            onClick={() => setActiveTab('reference')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-label font-medium rounded-lg transition-colors ${
              activeTab === 'reference'
                ? 'bg-[#182b24] text-primary border border-primary/30'
                : 'text-primary hover:bg-[#1b2824]'
            }`}
          >
            <span className="material-symbols-outlined text-base">bookmark</span>
            Formula Presets
          </button>

          <button
            onClick={() => setActiveTab('promo')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-[#003823] text-xs font-label font-bold rounded-lg hover:bg-[#74c69d] transition-all shadow-[0_0_12px_rgba(82,183,136,0.3)] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base font-semibold">play_circle</span>
            Concept Video (20s)
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Strip */}
      <div className="md:hidden border-b border-[#23352f] bg-[#111b18] px-4 py-2 overflow-x-auto flex items-center gap-2">
        {sideNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#182b24] text-primary border border-primary/30 font-semibold'
                  : 'text-[#9cb3ab]'
              }`}
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ================= MAIN APP BODY WITH SIDENAV ================= */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="relative flex-col h-[calc(100vh-3.75rem)] w-72 p-4 shrink-0 overflow-y-auto bg-[#111b18] border-r border-[#23352f] hidden lg:flex justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#23352f]">
              <div className="w-10 h-10 rounded-lg bg-[#182b24] border border-primary/30 flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(82,183,136,0.2)]">
                <span className="material-symbols-outlined text-xl">auto_graph</span>
              </div>
              <div>
                <h2 className="font-headline text-sm font-semibold text-[#e2ece9] tracking-tight leading-tight">
                  Multivariable Calculus
                </h2>
                <p className="font-label text-xs text-[#6d857d] leading-tight mt-0.5">
                  Late-Night Study Suite
                </p>
              </div>
            </div>

            <div className="px-2 mb-2 text-[11px] font-label font-bold text-[#6d857d] tracking-wider uppercase">
              CANVAS WORKSPACES
            </div>

            <nav className="space-y-1">
              {sideNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={
                      isActive
                        ? 'w-full flex items-center gap-3 px-4 py-3 bg-[#182b24] text-primary border border-primary/30 rounded-lg font-semibold active:scale-[0.99] transition-transform duration-100 text-sm shadow-[0_0_12px_rgba(82,183,136,0.15)] text-left'
                        : 'w-full flex items-center gap-3 px-4 py-3 text-[#9cb3ab] rounded-lg font-medium hover:bg-[#1b2824] hover:text-[#e2ece9] transition-colors duration-150 active:scale-[0.99] text-sm text-left'
                    }
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-primary' : 'text-[#6d857d]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 p-3.5 bg-[#15221f] rounded-xl border border-[#23352f]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-tertiary">Remotion Promo</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                  600f • 30fps
                </span>
              </div>
              <p className="text-xs text-[#9cb3ab] leading-relaxed mb-3">
                100% programmatic 1920×1080 promo video for http://github.com/saadsulek/Partially.
              </p>
              <button
                onClick={() => setActiveTab('promo')}
                className="w-full py-2 bg-primary text-[#003823] font-label text-xs font-bold rounded-lg hover:bg-[#74c69d] transition-colors shadow-[0_0_10px_rgba(82,183,136,0.25)]"
              >
                Open Promo Player
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#23352f] space-y-1">
            <button
              onClick={() => setActiveTab('reference')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-150 text-sm text-left ${
                activeTab === 'reference'
                  ? 'bg-[#182b24] text-primary border border-primary/30'
                  : 'text-[#9cb3ab] hover:bg-[#1b2824] hover:text-[#e2ece9]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">table_chart</span>
              <span>Reference Tables</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT CANVAS ================= */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 space-y-6 bg-[#0d1513] h-[calc(100vh-3.75rem)]">
          {activeTab === 'promo' && <PromoVideoShowcase onNavigateTab={setActiveTab} />}

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

          {activeTab === 'reference' && (
            <section className="space-y-4">
              <div className="bg-[#111b18] border border-[#23352f] rounded-xl p-5 shadow-lg shadow-black/20">
                <h1 className="font-headline text-2xl font-bold text-[#e2ece9]">
                  Multivariable Calculus Reference Tables
                </h1>
                <p className="text-sm text-[#9cb3ab] mt-1">
                  Core definitions and operator identities for first-year engineering students.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormulaCard
                  title="Limit Definition (∂f/∂x)"
                  subtitle="Holding y = y₀ constant"
                  badge="1st Order"
                  badgeColor="primary"
                  tex="f_x(x_0, y_0) = \lim_{h \to 0} \frac{f(x_0 + h, y_0) - f(x_0, y_0)}{h}"
                  explanation="Instantaneous slope of the 1D curve obtained by slicing the surface with vertical plane y = y₀."
                />
                <FormulaCard
                  title="Limit Definition (∂f/∂y)"
                  subtitle="Holding x = x₀ constant"
                  badge="1st Order"
                  badgeColor="tertiary"
                  tex="f_y(x_0, y_0) = \lim_{k \to 0} \frac{f(x_0, y_0 + k) - f(x_0, y_0)}{k}"
                  explanation="Instantaneous slope of the 1D curve obtained by slicing the surface with vertical plane x = x₀."
                />
                <FormulaCard
                  title="Tangent Plane Linearization"
                  subtitle="Local 2D Linear Approximation"
                  badge="Geometry"
                  badgeColor="primary"
                  tex="z - z_0 = f_x(x_0,y_0)(x - x_0) + f_y(x_0,y_0)(y - y_0)"
                  explanation="Unique plane tangent to z = f(x,y) at (x₀, y₀, z₀) spanned by vectors ⟨1, 0, fₓ⟩ and ⟨0, 1, fᵧ⟩."
                />
                <FormulaCard
                  title="Curl of a Vector Field (∇ × F)"
                  subtitle="3D Rotational Vorticity Operator"
                  badge="Vector Calc"
                  badgeColor="tertiary"
                  tex="\nabla \times \vec{F} = \left(\frac{\partial R}{\partial y} - \frac{\partial Q}{\partial z}\right)\hat{i} + \left(\frac{\partial P}{\partial z} - \frac{\partial R}{\partial x}\right)\hat{j} + \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)\hat{k}"
                  explanation="Measures microscopic circulation density around each coordinate axis. If ∇ × F = 0 everywhere, F is conservative."
                />
              </div>
            </section>
          )}

          <footer className="pt-6 pb-2 text-center text-xs text-[#6d857d] font-label">
            Partially (TerraCalc ∂/∂x) Multivariable Suite • Late-Night Spectral Obsidian Edition • Literata &amp; JetBrains Mono
          </footer>
        </main>
      </div>
    </div>
  );
}
