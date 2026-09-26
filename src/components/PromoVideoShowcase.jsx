import React, { useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { PartiallyPromo } from '../PartiallyPromo';
import { MathTex } from './FormulaCard';

const VIDEO_CHAPTERS = [
  {
    id: 'ch1',
    number: '01',
    time: '00:00 – 00:04',
    startFrame: 0,
    title: 'What is a Partial Derivative?',
    formula: '\\frac{\\partial f}{\\partial x} \\;(\\text{hold } y = y_0) \\quad \\text{vs.} \\quad \\frac{\\partial f}{\\partial y} \\;(\\text{hold } x = x_0)',
    summary:
      'On a 3D surface z = f(x, y), slope depends on direction. We freeze one variable as a constant and differentiate the active variable.',
    targetTab: 'moduleA',
    targetLabel: 'OPEN 3D SLICING LAB',
    accent: '#38bdf8',
  },
  {
    id: 'ch2',
    number: '02',
    time: '00:04 – 00:08',
    startFrame: 120,
    title: '3D Slicing Planes & Tangent Plane',
    formula: 'z - z_0 = f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0)',
    summary:
      'Cutting z = f(x, y) with vertical planes y = y₀ and x = x₀ creates 1D intersection curves whose tangent vectors Tₓ and Tᵧ span the Tangent Plane.',
    targetTab: 'moduleA',
    targetLabel: 'EXPLORE SLICING PLANES',
    accent: '#f59e0b',
  },
  {
    id: 'ch3',
    number: '03',
    time: '00:08 – 00:15',
    startFrame: 240,
    title: 'Symbolic Rules, Gradient ∇f & Clairaut’s Theorem',
    formula: 'f(x,y)=3x^2y^3-5xy+4y^2 \\implies \\frac{\\partial f}{\\partial x}=6xy^3-5y',
    summary:
      'Step-by-step Constant Multiple, Power, and Pure Constant rules, plus how ∇f = ⟨fₓ, fᵧ⟩ points uphill and why mixed partials satisfy fₓᵧ = fᵧₓ.',
    targetTab: 'moduleB',
    targetLabel: 'OPEN SYMBOLIC SOLVER',
    accent: '#38bdf8',
  },
  {
    id: 'ch4',
    number: '04',
    time: '00:15 – 00:20',
    startFrame: 450,
    title: 'Vector Curl (∇ × F) & Vorticity Paddlewheel',
    formula: '\\nabla \\times \\vec{F} = \\left(\\frac{\\partial R}{\\partial y}-\\frac{\\partial Q}{\\partial z}\\right)\\hat{i} - \\left(\\frac{\\partial R}{\\partial x}-\\frac{\\partial P}{\\partial z}\\right)\\hat{j} + \\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)\\hat{k}',
    summary:
      'Unpacks the 3×3 determinant for vector field rotation and visualizes microscopic circulation ω_z = ∂Q/∂x − ∂P/∂y with a spinning paddlewheel.',
    targetTab: 'curl',
    targetLabel: 'OPEN CURL (∇×F) LAB',
    accent: '#f59e0b',
  },
];

export default function PromoVideoShowcase({ onNavigateTab }) {
  const playerRef = useRef(null);
  const [activeChapter, setActiveChapter] = useState('ch1');

  const seekToChapter = (chapter) => {
    setActiveChapter(chapter.id);
    if (playerRef.current) {
      playerRef.current.seekTo(chapter.startFrame);
      playerRef.current.play();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <div className="border border-border bg-surface p-4 rounded-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
            MODULE 06 // PROGRAMMATIC VIDEO CONSOLE
          </div>
          <h2 className="font-serif text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
            Animated Multivariable Calculus Concept Walkthrough
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            20-second programmatic Remotion video (600 frames at 30fps). Select a chapter to seek the video or jump into the interactive workspace.
          </p>
        </div>

        <button
          onClick={() => seekToChapter(VIDEO_CHAPTERS[0])}
          className="px-3 py-1.5 font-mono text-xs font-semibold bg-surface-raised hover:bg-zinc-800 text-zinc-200 border border-border rounded transition-colors self-start sm:self-auto shrink-0"
        >
          REPLAY (CH 01)
        </button>
      </div>

      {/* Remotion Player Frame with 1px Hairline Border */}
      <div className="border border-border bg-canvas rounded-md overflow-hidden shadow-xs">
        <div className="relative aspect-video w-full bg-black">
          <Player
            ref={playerRef}
            component={PartiallyPromo}
            durationInFrames={600}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls
            autoPlay
            loop
          />
        </div>
      </div>

      {/* Chapter Index Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {VIDEO_CHAPTERS.map((ch) => {
          const isSelected = activeChapter === ch.id;
          return (
            <div
              key={ch.id}
              onClick={() => seekToChapter(ch)}
              className={`p-4 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-brand bg-surface-raised ring-1 ring-brand'
                  : 'border-border bg-surface hover:border-zinc-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken border border-border font-bold text-zinc-300">
                      CH {ch.number}
                    </span>
                    <span className="text-zinc-500">{ch.time}</span>
                  </div>
                  <span className="text-brand-text text-[11px] font-semibold">
                    PLAY CHAPTER →
                  </span>
                </div>

                <h3 className="font-serif text-sm font-semibold text-zinc-100">
                  {ch.title}
                </h3>

                <div className="bg-surface-sunken border border-border-subtle p-2.5 rounded text-xs text-zinc-200 overflow-x-auto">
                  <MathTex tex={ch.formula} />
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {ch.summary}
                </p>
              </div>

              {onNavigateTab && (
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    INTERACTIVE LAB
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTab(ch.targetTab);
                    }}
                    className="px-2.5 py-1 rounded bg-surface-sunken hover:bg-zinc-800 text-[11px] font-mono text-zinc-200 border border-border transition-colors"
                  >
                    {ch.targetLabel}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
