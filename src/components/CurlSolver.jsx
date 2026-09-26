import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MathTex } from './FormulaCard';
import { analyzeVectorField, VECTOR_FIELD_PRESETS } from '../utils/mathEngine';

export default function CurlSolver({ x0, setX0, y0, setY0 }) {
  const [compP, setCompP] = useState('y*z');
  const [compQ, setCompQ] = useState('-x*z');
  const [compR, setCompR] = useState('x*y');
  const [z0, setZ0] = useState(1.0);

  const canvasRef = useRef(null);
  const wheelAngleRef = useRef(0);

  const curlAnalysis = useMemo(
    () => analyzeVectorField(compP, compQ, compR),
    [compP, compQ, compR]
  );

  const evalData = useMemo(() => {
    if (!curlAnalysis.isValid) {
      return { fx: 0, fy: 0, fz: 0, cx: 0, cy: 0, cz: 0, mag: 0 };
    }
    return curlAnalysis.evaluateAt(x0, y0, z0);
  }, [curlAnalysis, x0, y0, z0]);

  const applyPreset = (preset) => {
    setCompP(preset.P);
    setCompQ(preset.Q);
    setCompR(preset.R);
  };

  // Precision 2D Vector Field + Spinning Paddlewheel Canvas (Swiss Technical Theme)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !curlAnalysis.isValid) return;
    const ctx = canvas.getContext('2d');
    const S = canvas.width;

    let animId;

    const renderFrame = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, S, S);

      // Clean 1px structural grid
      ctx.strokeStyle = '#1f1f23';
      ctx.lineWidth = 1;
      for (let k = -2; k <= 2; k++) {
        const p = ((k + 3) / 6) * S;
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, S);
        ctx.moveTo(0, p);
        ctx.lineTo(S, p);
        ctx.stroke();
      }

      // 2D slice of vector field F(x, y, z0)
      const gridN = 9;
      for (let j = 0; j <= gridN; j++) {
        const my = 2.6 - (5.2 * j) / gridN;
        for (let i = 0; i <= gridN; i++) {
          const mx = -2.6 + (5.2 * i) / gridN;
          const { fx, fy } = curlAnalysis.evaluateAt(mx, my, z0);
          const mag = Math.hypot(fx, fy);
          if (mag < 1e-4) continue;

          const px = ((mx + 3) / 6) * S;
          const py = ((3 - my) / 6) * S;

          const scale = Math.min(18, 6 + Math.log1p(mag) * 6) / mag;
          const vx = fx * scale;
          const vy = -fy * scale;

          ctx.strokeStyle = '#52525b';
          ctx.fillStyle = '#52525b';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + vx, py + vy);
          ctx.stroke();

          const ang = Math.atan2(vy, vx);
          ctx.beginPath();
          ctx.moveTo(px + vx, py + vy);
          ctx.lineTo(px + vx - 4 * Math.cos(ang - 0.45), py + vy - 4 * Math.sin(ang - 0.45));
          ctx.lineTo(px + vx - 4 * Math.cos(ang + 0.45), py + vy - 4 * Math.sin(ang + 0.45));
          ctx.closePath();
          ctx.fill();
        }
      }

      // Spinning Paddlewheel at (x0, y0)
      const cz = evalData.cz;
      const clampedSpin = Math.max(-0.12, Math.min(0.12, cz * 0.018));
      wheelAngleRef.current += clampedSpin;

      const cxPx = ((x0 + 3) / 6) * S;
      const cyPx = ((3 - y0) / 6) * S;
      const wheelRadius = 22;

      ctx.save();
      ctx.translate(cxPx, cyPx);

      const ringColor = Math.abs(cz) < 1e-3 ? '#71717a' : cz > 0 ? '#38bdf8' : '#f59e0b';
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, wheelRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.rotate(-wheelAngleRef.current);

      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 2;
      for (let b = 0; b < 4; b++) {
        const bladeAngle = (b * Math.PI) / 2;
        const bx = Math.cos(bladeAngle) * wheelRadius;
        const by = Math.sin(bladeAngle) * wheelRadius;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bx, by);
        ctx.stroke();

        ctx.fillStyle = ringColor;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#f4f4f5';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [curlAnalysis, x0, y0, z0, evalData.cz]);

  const updatePointFromCanvas = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ry = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setX0(Number((-3 + rx * 6).toFixed(2)));
    setY0(Number((3 - ry * 6).toFixed(2)));
  };

  const isConservative = curlAnalysis.isValid && curlAnalysis.isConservative;

  return (
    <section className="space-y-4">
      {/* Header & Vector Field Setup Bar */}
      <div className="border border-border bg-surface p-4 rounded-md shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
              MODULE 03 // VECTOR CALCULUS ENGINE
            </div>
            <h1 className="font-serif text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
              Curl of a 3D Vector Field (∇ × F)
            </h1>
          </div>

          {/* Presets Segmented Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">PRESETS:</span>
            {VECTOR_FIELD_PRESETS.map((preset) => {
              const isSelected =
                compP === preset.P && compQ === preset.Q && compR === preset.R;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                    isSelected
                      ? 'bg-surface-raised border-brand text-zinc-100 font-semibold'
                      : 'bg-surface-sunken border-border text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Component Inputs: P(i), Q(j), R(k) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-surface-sunken border border-border p-2.5 rounded flex items-center gap-2">
            <span className="text-sky-400 font-bold shrink-0">P(x,y,z)î =</span>
            <input
              type="text"
              value={compP}
              onChange={(e) => setCompP(e.target.value)}
              placeholder="y*z"
              className="w-full bg-transparent text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="bg-surface-sunken border border-border p-2.5 rounded flex items-center gap-2">
            <span className="text-amber-400 font-bold shrink-0">Q(x,y,z)ĵ =</span>
            <input
              type="text"
              value={compQ}
              onChange={(e) => setCompQ(e.target.value)}
              placeholder="-x*z"
              className="w-full bg-transparent text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="bg-surface-sunken border border-border p-2.5 rounded flex items-center gap-2">
            <span className="text-zinc-300 font-bold shrink-0">R(x,y,z)k̂ =</span>
            <input
              type="text"
              value={compR}
              onChange={(e) => setCompR(e.target.value)}
              placeholder="x*y"
              className="w-full bg-transparent text-zinc-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Dual-Pane: 7 cols (Determinant Expansion) + 5 cols (Vorticity Canvas) */}
      {curlAnalysis.isValid && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Left 7 Cols: Formal Determinant Expansion Ledger */}
          <div className="xl:col-span-7 space-y-4">
            {/* Step 1: 3x3 Determinant Form */}
            <div className="border border-border bg-surface p-4 rounded-md shadow-xs space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                <span>01 // SYMBOLIC 3×3 DETERMINANT OPERATOR</span>
                <span>CROSS-PRODUCT FORM</span>
              </div>

              <div className="bg-surface-sunken border border-border-subtle p-3.5 rounded overflow-x-auto text-center font-mono text-zinc-100">
                <MathTex
                  tex="\nabla \times \vec{F} = \begin{vmatrix} \hat{i} & \hat{j} & \hat{k} \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ P & Q & R \end{vmatrix}"
                  block
                />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The Cartesian curl is evaluated by computing the formal determinant of the Del operator ∇ with vector field components P, Q, and R.
              </p>
            </div>

            {/* Step 2: 3 Cofactors Expansion */}
            <div className="border border-border bg-surface rounded-md shadow-xs overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-surface-sunken text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                02 // 2×2 MINOR COFACTOR EXPANSION BY ROWS
              </div>

              <div className="divide-y divide-border text-xs font-mono">
                {/* i-component */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 font-bold">î-Component // (∂R/∂y − ∂Q/∂z)</span>
                    <span className="text-zinc-200">{evalData.cx.toFixed(3)}</span>
                  </div>
                  <div className="bg-surface-sunken border border-border-subtle p-2.5 rounded text-zinc-300 overflow-x-auto">
                    <MathTex
                      tex={`\\frac{\\partial}{\\partial y}\\left[${curlAnalysis.latex.R || compR}\\right] - \\frac{\\partial}{\\partial z}\\left[${curlAnalysis.latex.Q || compQ}\\right] = \\left(${curlAnalysis.latex.dR_dy || '0'}\\right) - \\left(${curlAnalysis.latex.dQ_dz || '0'}\\right) = \\mathbf{${curlAnalysis.latex.curlX || '0'}}`}
                      block
                    />
                  </div>
                </div>

                {/* j-component */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">ĵ-Component // (∂P/∂z − ∂R/∂x)</span>
                    <span className="text-zinc-200">{evalData.cy.toFixed(3)}</span>
                  </div>
                  <div className="bg-surface-sunken border border-border-subtle p-2.5 rounded text-zinc-300 overflow-x-auto">
                    <MathTex
                      tex={`\\frac{\\partial}{\\partial z}\\left[${curlAnalysis.latex.P || compP}\\right] - \\frac{\\partial}{\\partial x}\\left[${curlAnalysis.latex.R || compR}\\right] = \\left(${curlAnalysis.latex.dP_dz || '0'}\\right) - \\left(${curlAnalysis.latex.dR_dx || '0'}\\right) = \\mathbf{${curlAnalysis.latex.curlY || '0'}}`}
                      block
                    />
                  </div>
                </div>

                {/* k-component */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-bold">k̂-Component // (∂Q/∂x − ∂P/∂y)</span>
                    <span className="text-zinc-200">{evalData.cz.toFixed(3)}</span>
                  </div>
                  <div className="bg-surface-sunken border border-border-subtle p-2.5 rounded text-zinc-300 overflow-x-auto">
                    <MathTex
                      tex={`\\frac{\\partial}{\\partial x}\\left[${curlAnalysis.latex.Q || compQ}\\right] - \\frac{\\partial}{\\partial y}\\left[${curlAnalysis.latex.P || compP}\\right] = \\left(${curlAnalysis.latex.dQ_dx || '0'}\\right) - \\left(${curlAnalysis.latex.dP_dy || '0'}\\right) = \\mathbf{${curlAnalysis.latex.curlZ || '0'}}`}
                      block
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Combined Result & Classification */}
            <div className="border border-border bg-surface p-4 rounded-md shadow-xs space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                <span>03 // RESULTING VORTICITY VECTOR</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] ${
                  isConservative
                    ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-400'
                    : 'border-blue-900/60 bg-blue-950/40 text-blue-400'
                }`}>
                  {isConservative ? 'IRROTATIONAL // CONSERVATIVE' : 'ROTATIONAL FIELD'}
                </span>
              </div>

              <div className="bg-surface-sunken border border-border-subtle p-3 rounded overflow-x-auto font-mono text-zinc-100">
                <MathTex
                  tex={`\\nabla \\times \\vec{F} = \\left\\langle ${curlAnalysis.latex.curlX || '0'},\\; ${curlAnalysis.latex.curlY || '0'},\\; ${curlAnalysis.latex.curlZ || '0'} \\right\\rangle = \\left(${curlAnalysis.latex.curlX || '0'}\\right)\\hat{i} + \\left(${curlAnalysis.latex.curlY || '0'}\\right)\\hat{j} + \\left(${curlAnalysis.latex.curlZ || '0'}\\right)\\hat{k}`}
                  block
                />
              </div>
            </div>
          </div>

          {/* Right 5 Cols: 2D Vorticity Canvas & Point Controls */}
          <div className="xl:col-span-5 border border-border bg-surface rounded-md shadow-xs overflow-hidden flex flex-col space-y-3 p-3.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 pb-2 border-b border-border">
              <span>LOCAL CIRCULATION SIMULATOR</span>
              <span>XY-PLANE (Z = {z0.toFixed(1)})</span>
            </div>

            {/* Canvas Container */}
            <div className="relative aspect-square w-full bg-canvas border border-border rounded overflow-hidden cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                onClick={updatePointFromCanvas}
                className="w-full h-full block"
              />

              <div className="absolute top-2 left-2 bg-surface/90 border border-border rounded px-2 py-1 text-[10px] font-mono text-zinc-400 pointer-events-none">
                <span>VORTICITY ω_z: </span>
                <span className="text-zinc-100 font-bold">{evalData.cz.toFixed(3)} rad/s</span>
              </div>
            </div>

            {/* Z0 Height Slider */}
            <div className="bg-surface-sunken border border-border p-2.5 rounded space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">EVALUATION PLANE Z₀:</span>
                <span className="text-zinc-100 font-bold">{z0.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                value={z0}
                onChange={(e) => setZ0(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Evaluation Point Telemetry Table */}
            <div className="border border-border bg-surface-sunken rounded p-3 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>FIELD VALUE F(P₀):</span>
                <span className="text-zinc-200">
                  ⟨{evalData.fx.toFixed(2)}, {evalData.fy.toFixed(2)}, {evalData.fz.toFixed(2)}⟩
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>CURL VALUE (∇×F)(P₀):</span>
                <span className="text-zinc-100 font-bold">
                  ⟨{evalData.cx.toFixed(2)}, {evalData.cy.toFixed(2)}, {evalData.cz.toFixed(2)}⟩
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-1.5 border-t border-border-subtle">
                <span>TOTAL ROTATION MAG:</span>
                <span className="text-brand-text font-bold">
                  |∇×F| = {evalData.mag.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
