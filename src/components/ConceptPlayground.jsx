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
  const isDraggingPointRef = useRef(false);

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

  // 1:1 Square Contour Map Canvas in Spectral Obsidian Theme
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

        // Spectral Obsidian color ramp (#08100e -> #183a2c -> #2d6a4f)
        const r = Math.round(8 + t * 38);
        const g = Math.round(16 + t * 105);
        const b = Math.round(14 + t * 72);

        const idx = (py * S + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const numContours = 12;
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = 'rgba(156, 179, 171, 0.28)';

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

    const drawVector = (vx, vy, color, label, lineWidth = 2.5) => {
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
      const headLen = 8;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(label, ex + 7 * Math.cos(angle), ey + 7 * Math.sin(angle));
      }
      ctx.restore();
    };

    const { fx, fy, gradMag, ux, uy } = gradientData;
    const vecScale = gradMag > 0.001 ? Math.min(72, Math.max(26, gradMag * 18)) / gradMag : 0;
    const pxFx = fx * vecScale;
    const pxFy = fy * vecScale;

    drawVector(pxFx, 0, '#52b788', 'fx î', 2.4);
    drawVector(0, pxFy, '#e7c268', 'fy ĵ', 2.4);
    drawVector(pxFx, pxFy, '#4ade80', '∇f', 3.0);
    drawVector(ux * 52, uy * 52, '#e2ece9', 'û', 2.2);

    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#52b788';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0d1513';
    ctx.stroke();
  }, [analysis, x0, y0, gradientData]);

  const updatePointFromCanvasEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setX0(Number((-3 + relX * 6).toFixed(2)));
    setY0(Number((3 - relY * 6).toFixed(2)));
  };

  return (
    <section className="space-y-6">
      {/* 1. Clairaut's Theorem Side-by-Side Comparison */}
      <div className="bg-[#111b18] rounded-xl border border-[#23352f] p-5 shadow-lg shadow-black/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#23352f]">
          <div>
            <h2 className="font-headline text-xl font-bold text-[#e2ece9]">
              Clairaut&apos;s Theorem Explorer (<MathTex tex="f_{xy} = f_{yx}" />)
            </h2>
            <p className="text-xs text-[#9cb3ab] mt-0.5">
              Side-by-side verification that mixed partial derivatives commute for smooth <MathTex tex="C^2" /> surfaces.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#182b24] border border-primary/30 text-primary text-xs font-mono font-bold shrink-0">
            fₓᵧ({x0.toFixed(1)}, {y0.toFixed(1)}) = fᵧₓ({x0.toFixed(1)}, {y0.toFixed(1)}) = {evalVals.fxy.toFixed(3)}
          </div>
        </div>

        {analysis.isValid && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-primary/30 bg-[#15221f] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span>Path A: ∂/∂x first, then ∂/∂y</span>
                <MathTex tex="f_{xy} = \frac{\partial}{\partial y}\left(\frac{\partial f}{\partial x}\right)" />
              </div>

              <div className="p-3 rounded-lg bg-[#0d1513] border border-[#23352f] text-xs space-y-1">
                <div className="text-[#6d857d] font-mono">1. First partial fₓ:</div>
                <div className="overflow-x-auto">
                  <MathTex tex={`f_x = ${analysis.latex.fx}`} block />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1513] border border-primary/30 text-xs space-y-1">
                <div className="text-primary font-mono">2. Mixed partial fₓᵧ:</div>
                <div className="overflow-x-auto">
                  <MathTex tex={`f_{xy} = ${analysis.latex.fxy}`} block />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-tertiary/30 bg-[#15221f] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-tertiary">
                <span>Path B: ∂/∂y first, then ∂/∂x</span>
                <MathTex tex="f_{yx} = \frac{\partial}{\partial x}\left(\frac{\partial f}{\partial y}\right)" />
              </div>

              <div className="p-3 rounded-lg bg-[#0d1513] border border-[#23352f] text-xs space-y-1">
                <div className="text-[#6d857d] font-mono">1. First partial fᵧ:</div>
                <div className="overflow-x-auto">
                  <MathTex tex={`f_y = ${analysis.latex.fy}`} block />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1513] border border-tertiary/30 text-xs space-y-1">
                <div className="text-tertiary font-mono">2. Mixed partial fᵧₓ:</div>
                <div className="overflow-x-auto">
                  <MathTex tex={`f_{yx} = ${analysis.latex.fyx}`} block />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Directional Derivative & Gradient 2D Contour Explorer */}
      <div className="bg-[#111b18] rounded-xl border border-[#23352f] p-5 shadow-lg shadow-black/20">
        <div className="pb-4 mb-4 border-b border-[#23352f]">
          <h2 className="font-headline text-xl font-bold text-[#e2ece9]">
            Gradient Vector (<MathTex tex="\nabla f" />) &amp; 2D Contour Map
          </h2>
          <p className="text-xs text-[#9cb3ab] mt-0.5">
            Click or drag on the square contour map to move <MathTex tex="(x_0, y_0)" />. Notice that <MathTex tex="\nabla f = \langle f_x, f_y \rangle" /> is always orthogonal to the contour lines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[360px] rounded-xl border border-[#23352f] bg-[#08100e] overflow-hidden shadow-md">
              <div className="px-3 py-2 bg-[#15221f] border-b border-[#23352f] flex items-center justify-between text-[11px] font-mono text-[#9cb3ab]">
                <span>Drag Point ({x0.toFixed(2)}, {y0.toFixed(2)})</span>
                <span className="text-primary font-bold">∇f ⊥ Contours</span>
              </div>

              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                onPointerDown={(e) => {
                  isDraggingPointRef.current = true;
                  updatePointFromCanvasEvent(e);
                }}
                onPointerMove={(e) => {
                  if (isDraggingPointRef.current) updatePointFromCanvasEvent(e);
                }}
                onPointerUp={() => {
                  isDraggingPointRef.current = false;
                }}
                onPointerLeave={() => {
                  isDraggingPointRef.current = false;
                }}
                className="w-full aspect-square cursor-crosshair touch-none block"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl border border-[#23352f] bg-[#15221f] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e2ece9]">
                  Direction Angle <MathTex tex="\theta" /> for Unit Vector <MathTex tex="\vec{u} = \langle \cos\theta, \sin\theta \rangle" />
                </span>
                <span className="font-mono font-bold text-primary">θ = {dirAngleDeg.toFixed(0)}°</span>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={dirAngleDeg}
                onChange={(e) => setDirAngleDeg(parseFloat(e.target.value))}
                className="w-full obsidian-slider-mint h-1.5 bg-[#1b2824] rounded-lg cursor-pointer"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDirAngleDeg(Math.round(gradientData.gradAngleDeg))}
                  className="px-2.5 py-1 rounded-md bg-[#182b24] border border-primary/30 text-primary text-xs font-medium"
                >
                  Steepest Ascent (+∇f)
                </button>
                <button
                  onClick={() => setDirAngleDeg(Math.round((gradientData.gradAngleDeg + 90) % 360))}
                  className="px-2.5 py-1 rounded-md bg-[#0d1513] border border-[#23352f] text-[#9cb3ab] hover:text-[#e2ece9] text-xs font-medium"
                >
                  Zero Change (Dᵤf = 0)
                </button>
                <button
                  onClick={() => setDirAngleDeg(Math.round((gradientData.gradAngleDeg + 180) % 360))}
                  className="px-2.5 py-1 rounded-md bg-[#4a3b10]/50 border border-tertiary/30 text-tertiary text-xs font-medium"
                >
                  Steepest Descent (-∇f)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormulaCard
                title="Gradient Vector ∇f"
                subtitle="Steepest Ascent"
                badge={`‖∇f‖ = ${gradientData.gradMag.toFixed(2)}`}
                badgeColor="primary"
                tex={`\\nabla f = \\langle f_x, f_y \\rangle = \\langle ${gradientData.fx.toFixed(2)}, ${gradientData.fy.toFixed(2)} \\rangle`}
                explanation="Vector sum of orthogonal partial derivatives fx î + fy ĵ."
              />

              <FormulaCard
                title="Directional Derivative Dᵤf"
                subtitle={`Along θ = ${dirAngleDeg.toFixed(0)}°`}
                badge={`Dᵤf = ${gradientData.dirDeriv >= 0 ? '+' : ''}${gradientData.dirDeriv.toFixed(2)}`}
                badgeColor="tertiary"
                tex={`D_{\\vec{u}}f = \\nabla f \\cdot \\vec{u} = \\|\\nabla f\\|\\cos\\phi`}
                secondaryTex={`= ${gradientData.gradMag.toFixed(2)} \\cos(${gradientData.phiDeg.toFixed(0)}^\\circ) = ${gradientData.dirDeriv.toFixed(3)}`}
                explanation="Projection of the gradient onto the chosen unit direction vector."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
