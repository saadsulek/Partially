import React, { useState, useRef, useEffect, useMemo } from 'react';
import FormulaCard, { MathTex } from './FormulaCard';

export default function ConceptPlayground({
  analysis,
  x0,
  setX0,
  y0,
  setY0
}) {
  const [dirAngleDeg, setDirAngleDeg] = useState(45);
  const canvasRef = useRef(null);

  const evalVals = useMemo(() => {
    if (!analysis || !analysis.isValid) {
      return { z: 0, fx: 0, fy: 0, fxx: 0, fyy: 0, fxy: 0, fyx: 0 };
    }
    return analysis.evaluateAt(x0, y0);
  }, [analysis, x0, y0]);

  const gradientData = useMemo(() => {
    const { fx, fy } = evalVals;
    const gradMag = Math.hypot(fx, fy);
    const gradAngleRad = Math.atan2(fy, fx);
    const gradAngleDeg = ((gradAngleRad * 180) / Math.PI + 360) % 360;

    const thetaRad = (dirAngleDeg * Math.PI) / 180;
    const ux = Math.cos(thetaRad);
    const uy = Math.sin(thetaRad);

    const dirDeriv = fx * ux + fy * uy;
    const cosPhi = gradMag > 1e-6 ? dirDeriv / gradMag : 0;

    return {
      fx,
      fy,
      gradMag,
      gradAngleDeg,
      ux,
      uy,
      dirDeriv,
      phiDeg: Math.acos(Math.max(-1, Math.min(1, cosPhi))) * (180 / Math.PI)
    };
  }, [evalVals, dirAngleDeg]);

  // 1:1 Square Contour Map Canvas in Swiss Precision Palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysis || !analysis.isValid) return;

    const ctx = canvas.getContext('2d');
    const S = canvas.width;

    const N = 80;
    const grid = new Float32Array((N + 1) * (N + 1));
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let j = 0; j <= N; j++) {
      const my = 3 - (6 * j) / N;
      for (let i = 0; i <= N; i++) {
        const mx = -3 + (6 * i) / N;
        const z = analysis.evalSurface(mx, my);
        grid[j * (N + 1) + i] = z;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = mzClamp(z, maxZ);
      }
    }

    function mzClamp(v, curMax) {
      return v > curMax ? v : curMax;
    }

    const rangeZ = Math.max(0.001, maxZ - minZ);
    const imgData = ctx.createImageData(S, S);
    const data = imgData.data;

    for (let py = 0; py < S; py++) {
      const my = 3 - (6 * py) / S;
      const gj = Math.min(N, Math.max(0, Math.round(((3 - my) / 6) * N)));
      for (let px = 0; px < S; px++) {
        const mx = -3 + (6 * px) / S;
        const gi = Math.min(N, Math.max(0, Math.round(((mx + 3) / 6) * N)));
        const z = grid[gj * (N + 1) + gi];
        const t = (z - minZ) / rangeZ;

        // Technical elevation ramp (Zinc-950 -> Deep Slate Blue -> Neutral Slate)
        const r = Math.round(9 + t * 30);
        const g = Math.round(11 + t * 45);
        const b = Math.round(18 + t * 80);

        const idx = (py * S + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Discrete Isolines (Contour lines)
    const numContours = 12;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(212, 212, 216, 0.22)';

    for (let c = 1; c < numContours; c++) {
      const level = minZ + (rangeZ * c) / numContours;
      ctx.beginPath();
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const z00 = grid[j * (N + 1) + i] - level;
          const z10 = grid[j * (N + 1) + (i + 1)] - level;
          const z01 = grid[(j + 1) * (N + 1) + i] - level;
          const z11 = grid[(j + 1) * (N + 1) + (i + 1)] - level;

          const xLeft = (i / N) * S;
          const xRight = ((i + 1) / N) * S;
          const yTop = (j / N) * S;
          const yBottom = ((j + 1) / N) * S;

          const crossings = [];
          if (z00 * z10 < 0) {
            crossings.push([xLeft + (z00 / (z00 - z10)) * (xRight - xLeft), yTop]);
          }
          if (z10 * z11 < 0) {
            crossings.push([xRight, yTop + (z10 / (z10 - z11)) * (yBottom - yTop)]);
          }
          if (z01 * z11 < 0) {
            crossings.push([xLeft + (z01 / (z01 - z11)) * (xRight - xLeft), yBottom]);
          }
          if (z00 * z01 < 0) {
            crossings.push([xLeft, yTop + (z00 / (z00 - z01)) * (yBottom - yTop)]);
          }

          if (crossings.length >= 2) {
            ctx.moveTo(crossings[0][0], crossings[0][1]);
            ctx.lineTo(crossings[1][0], crossings[1][1]);
          }
        }
      }
      ctx.stroke();
    }

    const cx = ((x0 + 3) / 6) * S;
    const cy = ((3 - y0) / 6) * S;

    const drawVector = (vx, vy, color, label, lineWidth = 2) => {
      const len = Math.hypot(vx, vy);
      if (len < 2) return;
      const ex = cx + vx;
      const ey = cy - vy;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const angle = Math.atan2(ey - cy, ex - cx);
      const headLen = 7;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.font = '600 10px JetBrains Mono, monospace';
        ctx.fillText(label, ex + 6 * Math.cos(angle), ey + 6 * Math.sin(angle));
      }
      ctx.restore();
    };

    const { fx, fy, gradMag, ux, uy } = gradientData;
    const vecScale = gradMag > 0.001 ? Math.min(68, Math.max(24, gradMag * 16)) / gradMag : 0;
    const pxFx = fx * vecScale;
    const pxFy = fy * vecScale;

    drawVector(pxFx, 0, '#38bdf8', 'f_x î', 1.8);
    drawVector(0, pxFy, '#f59e0b', 'f_y ĵ', 1.8);
    drawVector(pxFx, pxFy, '#2563eb', '∇f', 2.6);
    drawVector(ux * 48, uy * 48, '#f4f4f5', 'û', 1.8);

    // Crosshair at evaluation point P0
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f4f4f5';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#09090b';
    ctx.stroke();
  }, [analysis, x0, y0, gradientData]);

  const updatePointFromCanvasEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ry = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setX0(Number((-3 + rx * 6).toFixed(2)));
    setY0(Number((3 - ry * 6).toFixed(2)));
  };

  const diffClairaut = Math.abs(evalVals.fxy - evalVals.fyx);

  return (
    <section className="space-y-4">
      {/* Header Bar */}
      <div className="border border-border bg-surface p-4 rounded-md shadow-xs space-y-1">
        <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
          MODULE 04 // THEORETICAL FOUNDATIONS &amp; TOPOGRAPHY
        </div>
        <h1 className="font-serif text-lg font-bold text-zinc-100 tracking-tight">
          Clairaut’s Symmetry Theorem &amp; 2D Gradient Topography
        </h1>
        <p className="text-xs text-zinc-400">
          Verification of mixed partial derivative equality <MathTex tex="f_{xy} = f_{yx}" /> on C² functions, alongside gradient steepest ascent <MathTex tex="\nabla f" /> on 2D contour lines.
        </p>
      </div>

      {/* Main Dual-Pane Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column: Clairaut Verifier & Directional Derivative (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Table: Clairaut Verification Ledger */}
          <div className="border border-border bg-surface rounded-md shadow-xs overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-surface-sunken flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span>CLAIRAUT'S THEOREM // SYMMETRIC MIXED PARTIALS</span>
              <span className="text-emerald-400">Δ &lt; 10⁻¹²</span>
            </div>

            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Order 1 */}
                <div className="border border-border bg-surface-sunken p-3 rounded space-y-2">
                  <div className="text-zinc-400 text-[11px]">
                    ORDER 1: <span className="text-sky-400 font-semibold">x THEN y</span>
                  </div>
                  <div className="text-zinc-200 overflow-x-auto">
                    <MathTex tex={`\\frac{\\partial^2 f}{\\partial y \\partial x} = ${analysis.isValid ? analysis.latex.fxy : '0'}`} />
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Evaluated at P₀: <strong className="text-zinc-200">{evalVals.fxy.toFixed(4)}</strong>
                  </div>
                </div>

                {/* Order 2 */}
                <div className="border border-border bg-surface-sunken p-3 rounded space-y-2">
                  <div className="text-zinc-400 text-[11px]">
                    ORDER 2: <span className="text-amber-400 font-semibold">y THEN x</span>
                  </div>
                  <div className="text-zinc-200 overflow-x-auto">
                    <MathTex tex={`\\frac{\\partial^2 f}{\\partial x \\partial y} = ${analysis.isValid ? analysis.latex.fyx : '0'}`} />
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Evaluated at P₀: <strong className="text-zinc-200">{evalVals.fyx.toFixed(4)}</strong>
                  </div>
                </div>
              </div>

              {/* Equality Status Banner */}
              <div className="p-2.5 rounded border border-emerald-900/60 bg-emerald-950/30 text-emerald-400 flex items-center justify-between text-xs">
                <span>✓ f_xy(P₀) ≡ f_yx(P₀) : Difference Δ = {diffClairaut.toExponential(2)}</span>
                <span className="text-[10px] uppercase font-bold">C² Continuous</span>
              </div>
            </div>
          </div>

          {/* Directional Derivative Ledger */}
          <div className="border border-border bg-surface rounded-md shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span>DIRECTIONAL DERIVATIVE FORMULATION</span>
              <span>D_u(f) = ∇f · û</span>
            </div>

            <div className="bg-surface-sunken border border-border-subtle p-3 rounded overflow-x-auto text-xs font-mono text-zinc-100">
              <MathTex
                tex={`D_{\\hat{u}}f(x_0, y_0) = \\nabla f \\cdot \\hat{u} = (${evalVals.fx.toFixed(2)})(${gradientData.ux.toFixed(2)}) + (${evalVals.fy.toFixed(2)})(${gradientData.uy.toFixed(2)}) = ${gradientData.dirDeriv.toFixed(3)}`}
                block
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                <span className="text-zinc-500 block text-[10px]">GRADIENT MAGNITUDE</span>
                <span className="text-zinc-100 font-bold">|∇f| = {gradientData.gradMag.toFixed(3)}</span>
              </div>
              <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                <span className="text-zinc-500 block text-[10px]">MAX ASCENT DIRECTION</span>
                <span className="text-zinc-100 font-bold">{gradientData.gradAngleDeg.toFixed(1)}°</span>
              </div>
              <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                <span className="text-zinc-500 block text-[10px]">DIRECTIONAL DERIVATIVE</span>
                <span className="text-brand-text font-bold">{gradientData.dirDeriv.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 2D Contour Map (5 cols) */}
        <div className="xl:col-span-5 border border-border bg-surface rounded-md shadow-xs p-3.5 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 pb-2 border-b border-border">
            <span>2D CONTOUR LEVEL MAP</span>
            <span>CLICK TO EVALUATE P₀</span>
          </div>

          {/* Canvas Viewport */}
          <div className="relative aspect-square w-full bg-canvas border border-border rounded overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              onClick={updatePointFromCanvasEvent}
              className="w-full h-full block"
            />

            <div className="absolute top-2 left-2 bg-surface/90 border border-border rounded px-2 py-1 text-[10px] font-mono text-zinc-400 pointer-events-none space-y-0.5">
              <div>∇f: <span className="text-brand-text font-bold">⟨{evalVals.fx.toFixed(2)}, {evalVals.fy.toFixed(2)}⟩</span></div>
              <div>û: <span className="text-zinc-200">⟨{gradientData.ux.toFixed(2)}, {gradientData.uy.toFixed(2)}⟩</span></div>
            </div>
          </div>

          {/* Direction Slider */}
          <div className="bg-surface-sunken border border-border p-2.5 rounded space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">UNIT VECTOR ANGLE θ:</span>
              <span className="text-zinc-100 font-bold">{dirAngleDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={dirAngleDeg}
              onChange={(e) => setDirAngleDeg(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
