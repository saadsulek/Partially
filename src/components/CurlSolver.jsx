import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MathTex } from './FormulaCard';
import { analyzeVectorField, VECTOR_FIELD_PRESETS } from '../utils/mathEngine';

export default function CurlSolver({ x0, setX0, y0, setY0 }) {
  const [compP, setCompP] = useState('y*z');
  const [compQ, setCompQ] = useState('-x*z');
  const [compR, setCompR] = useState('x*y');
  const [z0, setZ0] = useState(1.0);

  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
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

  // Interactive 2D Vector Field + Spinning Paddlewheel Canvas in Spectral Obsidian Theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !curlAnalysis.isValid) return;
    const ctx = canvas.getContext('2d');
    const S = canvas.width;

    let animId;

    const renderFrame = () => {
      ctx.fillStyle = '#08100e';
      ctx.fillRect(0, 0, S, S);

      // Subtle Spectral Obsidian grid
      ctx.strokeStyle = '#162722';
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

          ctx.strokeStyle = 'rgba(82, 183, 136, 0.65)';
          ctx.fillStyle = 'rgba(82, 183, 136, 0.65)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + vx, py + vy);
          ctx.stroke();

          const ang = Math.atan2(vy, vx);
          ctx.beginPath();
          ctx.moveTo(px + vx, py + vy);
          ctx.lineTo(px + vx - 4.5 * Math.cos(ang - 0.5), py + vy - 4.5 * Math.sin(ang - 0.5));
          ctx.lineTo(px + vx - 4.5 * Math.cos(ang + 0.5), py + vy - 4.5 * Math.sin(ang + 0.5));
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

      const ringColor =
        Math.abs(cz) < 1e-3 ? '#6d857d' : cz > 0 ? '#52b788' : '#e7c268';
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, wheelRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.rotate(-wheelAngleRef.current);

      ctx.strokeStyle = '#e2ece9';
      ctx.lineWidth = 2.2;
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
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#e2ece9';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
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

  return (
    <section className="space-y-6">
      {/* Workspace Header & Vector Field Input Card */}
      <div className="bg-[#111b18] border border-[#23352f] rounded-xl p-5 shadow-lg shadow-black/20 space-y-4">
        <div className="flex items-center gap-2 text-xs font-label text-[#6d857d]">
          <span>Calculus III</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Vector Calculus</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-semibold">Curl of a Vector Field (∇ × F)</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#e2ece9] tracking-tight">
              Solving Curl of Vector Field <MathTex tex="\vec{F}(x, y, z) = P\hat{i} + Q\hat{j} + R\hat{k}" />
            </h1>
            <p className="text-sm text-[#9cb3ab] mt-1">
              Expand the 3×3 symbolic cross-product determinant <MathTex tex="\nabla \times \vec{F}" /> into three 2×2 cofactors to compute microscopic vorticity around each axis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {VECTOR_FIELD_PRESETS.map((preset) => {
              const isSelected =
                compP === preset.P && compQ === preset.Q && compR === preset.R;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-[#182b24] text-primary border-primary/40 font-semibold shadow-[0_0_10px_rgba(82,183,136,0.2)]'
                      : 'bg-[#15221f] text-[#9cb3ab] border-[#23352f] hover:text-[#e2ece9]'
                  }`}
                >
                  {preset.name}: <span className="font-mono">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Component Inputs: P, Q, R */}
        <div className="pt-4 border-t border-[#23352f] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative flex items-center">
            <span className="absolute left-3 font-mono text-xs font-bold text-primary">
              P(î) =
            </span>
            <input
              type="text"
              value={compP}
              onChange={(e) => setCompP(e.target.value)}
              placeholder="y*z"
              className="w-full pl-16 pr-3 py-2 rounded-lg font-mono text-xs bg-[#15221f] border border-[#23352f] text-[#e2ece9] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3 font-mono text-xs font-bold text-tertiary">
              Q(ĵ) =
            </span>
            <input
              type="text"
              value={compQ}
              onChange={(e) => setCompQ(e.target.value)}
              placeholder="-x*z"
              className="w-full pl-16 pr-3 py-2 rounded-lg font-mono text-xs bg-[#15221f] border border-[#23352f] text-[#e2ece9] focus:outline-none focus:ring-1 focus:ring-tertiary"
            />
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3 font-mono text-xs font-bold text-secondary">
              R(k̂) =
            </span>
            <input
              type="text"
              value={compR}
              onChange={(e) => setCompR(e.target.value)}
              placeholder="x*y"
              className="w-full pl-16 pr-3 py-2 rounded-lg font-mono text-xs bg-[#15221f] border border-[#23352f] text-[#e2ece9] focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>
      </div>

      {/* Main 12-Col Grid */}
      {curlAnalysis.isValid && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: 3-Step Curl Determinant Solver */}
          <div className="xl:col-span-7 space-y-4">
            {/* Step 1: 3x3 Determinant */}
            <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_8px_#52b788]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-xs font-bold rounded">
                    Step 1
                  </span>
                  <h3 className="font-headline font-bold text-sm text-[#e2ece9]">
                    Set Up the 3×3 Cross-Product Determinant (<MathTex tex="\nabla \times \vec{F}" />)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#6d857d]">ℝ³ → ℝ³</span>
              </div>

              <div className="p-4 rounded-lg bg-[#15221f] border border-[#23352f] overflow-x-auto">
                <MathTex
                  tex={`\\nabla \\times \\vec{F} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\[4pt] \\dfrac{\\partial}{\\partial x} & \\dfrac{\\partial}{\\partial y} & \\dfrac{\\partial}{\\partial z} \\\\[8pt] ${curlAnalysis.latex.P} & ${curlAnalysis.latex.Q} & ${curlAnalysis.latex.R} \\end{vmatrix}`}
                  block
                />
              </div>
            </div>

            {/* Step 2: 2x2 Minor Determinants */}
            <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary shadow-[0_0_8px_#e7c268]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-tertiary/20 border border-tertiary/40 text-tertiary text-xs font-bold rounded">
                    Step 2
                  </span>
                  <h3 className="font-headline font-bold text-sm text-[#e2ece9]">
                    Cofactor Expansion into Three 2×2 Sub-Determinants
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#182b24] text-primary text-[11px] font-mono border border-primary/25">
                  Signs: +î, −ĵ, +k̂
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-[#15221f] border border-[#23352f] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span>î-Component (x-axis vorticity):</span>
                    <MathTex tex="+\hat{i}\left(\frac{\partial R}{\partial y} - \frac{\partial Q}{\partial z}\right)" />
                  </div>
                  <div className="p-2.5 rounded bg-[#0d1513] border border-[#23352f] overflow-x-auto text-xs">
                    <MathTex
                      tex={`\\frac{\\partial}{\\partial {\\textcolor{#52b788}{y}}}\\left[${curlAnalysis.latex.R}\\right] - \\frac{\\partial}{\\partial {\\textcolor{#52b788}{z}}}\\left[${curlAnalysis.latex.Q}\\right] = \\left(${curlAnalysis.latex.dR_dy}\\right) - \\left(${curlAnalysis.latex.dQ_dz}\\right) = \\mathbf{${curlAnalysis.latex.curlX}}`}
                      block
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#15221f] border border-[#23352f] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-tertiary">
                    <span>ĵ-Component (y-axis vorticity — alternating minus!):</span>
                    <MathTex tex="-\hat{j}\left(\frac{\partial R}{\partial x} - \frac{\partial P}{\partial z}\right) = \frac{\partial P}{\partial z} - \frac{\partial R}{\partial x}" />
                  </div>
                  <div className="p-2.5 rounded bg-[#0d1513] border border-[#23352f] overflow-x-auto text-xs">
                    <MathTex
                      tex={`\\frac{\\partial}{\\partial {\\textcolor{#52b788}{z}}}\\left[${curlAnalysis.latex.P}\\right] - \\frac{\\partial}{\\partial {\\textcolor{#52b788}{x}}}\\left[${curlAnalysis.latex.R}\\right] = \\left(${curlAnalysis.latex.dP_dz}\\right) - \\left(${curlAnalysis.latex.dR_dx}\\right) = \\mathbf{${curlAnalysis.latex.curlY}}`}
                      block
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#15221f] border border-[#23352f] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-secondary">
                    <span>k̂-Component (z-axis vorticity):</span>
                    <MathTex tex="+\hat{k}\left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)" />
                  </div>
                  <div className="p-2.5 rounded bg-[#0d1513] border border-[#23352f] overflow-x-auto text-xs">
                    <MathTex
                      tex={`\\frac{\\partial}{\\partial {\\textcolor{#52b788}{x}}}\\left[${curlAnalysis.latex.Q}\\right] - \\frac{\\partial}{\\partial {\\textcolor{#52b788}{y}}}\\left[${curlAnalysis.latex.P}\\right] = \\left(${curlAnalysis.latex.dQ_dx}\\right) - \\left(${curlAnalysis.latex.dP_dy}\\right) = \\mathbf{${curlAnalysis.latex.curlZ}}`}
                      block
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Final Simplified Curl Vector */}
            <div className="bg-[#111b18] rounded-xl p-5 border border-primary/40 shadow-lg shadow-black/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary text-[#003823] text-xs font-bold rounded">
                    Step 3
                  </span>
                  <h3 className="font-headline font-bold text-sm text-[#e2ece9]">
                    Simplified Curl Vector <MathTex tex="\operatorname{curl}\vec{F} = \nabla \times \vec{F}" />
                  </h3>
                </div>

                <span className="px-2.5 py-0.5 rounded bg-[#182b24] border border-primary/30 text-primary text-xs font-mono font-bold">
                  {curlAnalysis.isConservative
                    ? 'Conservative / Irrotational (∇ × F = 0)'
                    : 'Rotational Vortex Field (∇ × F ≠ 0)'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#15221f] border border-[#23352f] overflow-x-auto">
                <MathTex
                  tex={`\\nabla \\times \\vec{F} = \\left\\langle ${curlAnalysis.latex.curlX},\\; ${curlAnalysis.latex.curlY},\\; ${curlAnalysis.latex.curlZ} \\right\\rangle = \\left(${curlAnalysis.latex.curlX}\\right)\\hat{i} + \\left(${curlAnalysis.latex.curlY}\\right)\\hat{j} + \\left(${curlAnalysis.latex.curlZ}\\right)\\hat{k}`}
                  block
                />
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Spinning Paddlewheel Visualizer & Telemetry */}
          <div className="xl:col-span-5 bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-sm text-[#e2ece9]">
                  2D Paddlewheel Vorticity Simulator
                </h3>
                <p className="text-xs text-[#6d857d]">
                  Drag paddlewheel on slice <MathTex tex={`z_0 = ${z0.toFixed(1)}`} />. Spin speed equals <MathTex tex="(\nabla \times \vec{F})_z" />.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#182b24] border border-primary/30 text-primary text-xs font-mono font-bold">
                (∇×F)_z = {evalData.cz >= 0 ? `+${evalData.cz.toFixed(2)}` : evalData.cz.toFixed(2)}
              </span>
            </div>

            <div className="w-full max-w-[340px] mx-auto rounded-xl border border-[#23352f] bg-[#08100e] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                onPointerDown={(e) => {
                  isDraggingRef.current = true;
                  updatePointFromCanvas(e);
                }}
                onPointerMove={(e) => {
                  if (isDraggingRef.current) updatePointFromCanvas(e);
                }}
                onPointerUp={() => {
                  isDraggingRef.current = false;
                }}
                onPointerLeave={() => {
                  isDraggingRef.current = false;
                }}
                className="w-full aspect-square cursor-crosshair touch-none block"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#6d857d]">x₀</span>
                  <span className="text-primary font-bold">{x0.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={x0}
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full obsidian-slider-mint h-1.5 bg-[#1b2824] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#6d857d]">y₀</span>
                  <span className="text-tertiary font-bold">{y0.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={y0}
                  onChange={(e) => setY0(parseFloat(e.target.value))}
                  className="w-full obsidian-slider-gold h-1.5 bg-[#1b2824] rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#6d857d]">z₀</span>
                  <span className="text-secondary font-bold">{z0.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={z0}
                  onChange={(e) => setZ0(parseFloat(e.target.value))}
                  className="w-full obsidian-slider-mint h-1.5 bg-[#1b2824] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#15221f] border border-[#23352f] font-mono text-xs space-y-1">
              <div className="flex justify-between text-[#6d857d]">
                <span>EVALUATION AT ({x0.toFixed(1)}, {y0.toFixed(1)}, {z0.toFixed(1)})</span>
                <span>‖∇ × F‖ = {evalData.mag.toFixed(2)}</span>
              </div>
              <div className="text-sm font-bold text-[#e2ece9]">
                ∇ × F = [{evalData.cx.toFixed(2)}, {evalData.cy.toFixed(2)}, {evalData.cz.toFixed(2)}]ᵀ
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
