import React, { useRef, useState } from 'react';
import { Player } from '@remotion/player';
import {
  Play,
  RotateCcw,
  BookOpen,
  Layers,
  Compass,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
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
    targetLabel: 'Open 3D Slicing Lab',
    accent: '#52b788',
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
    targetLabel: 'Try Slicing Planes',
    accent: '#e7c268',
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
    targetLabel: 'Open Symbolic Solver',
    accent: '#52b788',
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
    targetLabel: 'Open Curl (∇ × F) Lab',
    accent: '#e7c268',
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
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-[#111b18] border border-[#23352f] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15221f] border border-[#52b788]/30 text-[#52b788] text-[11px] font-mono uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Animated Concept Crash Course • 1920×1080 @ 30fps
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#dbe5e0]">
            Visual Guide: Understanding Partial Differentiation
          </h2>
          <p className="text-sm text-[#bfc9c4] max-w-3xl">
            Watch the 20-second animated walkthrough of how{' '}
            <span className="text-[#52b788] font-mono font-semibold">Partially (TerraCalc ∂/∂x)</span>{' '}
            turns 3D surfaces into 2D slicing planes, solves symbolic derivatives term-by-term, and computes vector field Curl. Click any chapter below to jump directly to that concept.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => seekToChapter(VIDEO_CHAPTERS[0])}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#052918] font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay from Chapter 01
          </button>
        </div>
      </div>

      {/* Interactive Remotion Player Frame */}
      <div className="bg-[#111b18] border border-[#23352f] rounded-2xl p-3 sm:p-5 shadow-2xl">
        <div className="relative rounded-xl overflow-hidden border border-[#23352f] bg-[#0d1513] aspect-video w-full">
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

      {/* 4 Interactive Chapter Jump Cards + Formula Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VIDEO_CHAPTERS.map((ch) => {
          const isSelected = activeChapter === ch.id;
          return (
            <div
              key={ch.id}
              onClick={() => seekToChapter(ch)}
              className={`group rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-[#15221f] border-[#52b788] shadow-lg'
                  : 'bg-[#111b18] border-[#23352f] hover:border-[#3c4a45]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold"
                      style={{
                        backgroundColor: `${ch.accent}20`,
                        color: ch.accent,
                        border: `1px solid ${ch.accent}55`,
                      }}
                    >
                      CHAPTER {ch.number}
                    </span>
                    <span className="text-xs font-mono text-[#88938f]">
                      {ch.time}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-mono text-[#52b788] group-hover:underline">
                    <Play className="w-3 h-3 fill-current" />
                    Jump to Scene
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-[#dbe5e0]">
                  {ch.title}
                </h3>

                <div className="bg-[#0d1513] border border-[#23352f] rounded-xl px-3.5 py-2.5 overflow-x-auto">
                  <MathTex tex={ch.formula} className="text-sm text-[#dbe5e0]" />
                </div>

                <p className="text-xs sm:text-sm text-[#bfc9c4] leading-relaxed">
                  {ch.summary}
                </p>
              </div>

              {onNavigateTab && (
                <div className="pt-3 border-t border-[#23352f] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#88938f]">
                    Interactive Workspace Module
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTab(ch.targetTab);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1513] hover:bg-[#1e2b28] border border-[#23352f] text-xs font-mono font-semibold text-[#52b788] transition-colors cursor-pointer"
                  >
                    {ch.targetLabel}
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
