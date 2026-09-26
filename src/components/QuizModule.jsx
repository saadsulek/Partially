import React, { useState, useCallback } from 'react';
import { MathTex } from './FormulaCard';

const QUESTION_BANK = [
  {
    id: 'const-1',
    category: '1. Identifying Constant Terms',
    prompt: 'When computing the first-order partial derivative with respect to x:',
    formulaTex: '\\frac{\\partial}{\\partial {\\textcolor{#38bdf8}{x}}}\\Big[ 4x^3 y^2 - 7y^4 \\cos(y) + 9x - e^{2y} \\Big]',
    questionText: 'Which terms behave as pure constants (and therefore differentiate immediately to 0)?',
    options: [
      { id: 'a', tex: '-7y^4 \\cos(y) \\text{ and } -e^{2y}' },
      { id: 'b', tex: '4x^3 y^2 \\text{ and } -7y^4 \\cos(y)' },
      { id: 'c', tex: '\\text{Only } -e^{2y}' },
      { id: 'd', tex: '9x \\text{ and } -e^{2y}' }
    ],
    correctId: 'a',
    hint: 'During ∂/∂x, variable y is held constant. Any additive term with no x has zero rate of change with respect to x.',
    steps: [
      {
        title: 'Step 1: Identify Active vs. Constant Variables',
        tex: '\\text{Active: } {\\textcolor{#38bdf8}{x}} \\quad | \\quad \\text{Held constant: } {\\textcolor{#f59e0b}{y}}'
      },
      {
        title: 'Step 2: Apply Constant Rule to Pure-y Terms',
        tex: '\\frac{\\partial}{\\partial x}\\left[-7y^4\\cos(y)\\right] = 0, \\qquad \\frac{\\partial}{\\partial x}\\left[-e^{2y}\\right] = 0'
      }
    ]
  },
  {
    id: 'const-2',
    category: '1. Identifying Constant Terms',
    prompt: 'When computing ∂σ/∂y of the engineering stress function:',
    formulaTex: '\\sigma(x, y) = 5x^4 \\sin(y) + 12x^3 e^{-x} - 3y^2',
    questionText: 'How are the factor 5x⁴ and the middle term 12x³e⁻ˣ treated during ∂σ/∂y?',
    options: [
      { id: 'a', tex: '5x^4 \\text{ is a constant multiplier, while } 12x^3 e^{-x} \\text{ differentiates to } 0' },
      { id: 'b', tex: '\\text{Both require the Product Rule}' },
      { id: 'c', tex: '5x^4 \\text{ becomes } 20x^3, \\text{ while } 12x^3 e^{-x} \\text{ stays unchanged}' },
      { id: 'd', tex: '\\text{Both differentiate to } 0' }
    ],
    correctId: 'a',
    hint: '5x⁴ multiplies sin(y) (Constant Multiple Rule), whereas 12x³e⁻ˣ is an isolated additive term with no y (Constant Rule).',
    steps: [
      {
        title: 'Step 1: Apply Constant Multiple & Constant Rules',
        tex: '\\frac{\\partial}{\\partial y}\\left[(5x^4)\\sin(y)\\right] = 5x^4\\cos(y), \\qquad \\frac{\\partial}{\\partial y}\\left[12x^3 e^{-x}\\right] = 0'
      },
      {
        title: 'Step 2: Combine Terms',
        tex: '\\frac{\\partial \\sigma}{\\partial y} = 5x^4 \\cos(y) - 6y'
      }
    ]
  },
  {
    id: 'first-1',
    category: '2. First-Order Partial Derivatives',
    prompt: 'Find the first-order partial derivative ∂f/∂x of:',
    formulaTex: 'f(x, y) = x^3 y^4 - 2x y^2 + 6y^5',
    questionText: 'Which expression equals ∂f/∂x?',
    options: [
      { id: 'a', tex: '3x^2 y^4 - 2y^2' },
      { id: 'b', tex: '3x^2 y^4 - 2y^2 + 30y^4' },
      { id: 'c', tex: '12x^2 y^3 - 4xy' },
      { id: 'd', tex: '4x^3 y^3 - 4xy + 30y^4' }
    ],
    correctId: 'a',
    hint: 'Hold y constant: d/dx(x³) = 3x², d/dx(x) = 1, and d/dx(6y⁵) = 0.',
    steps: [
      {
        title: 'Step 1: Differentiate Term-by-Term w.r.t. x',
        tex: '\\frac{\\partial f}{\\partial x} = y^4(3x^2) - 2y^2(1) + 0 = 3x^2 y^4 - 2y^2'
      }
    ]
  },
  {
    id: 'first-2',
    category: '2. First-Order Partial Derivatives',
    prompt: 'Use the Chain Rule to compute ∂z/∂y for:',
    formulaTex: 'z = \\sin(3x + 2y^2)',
    questionText: 'What is ∂z/∂y?',
    options: [
      { id: 'a', tex: '4y \\cos(3x + 2y^2)' },
      { id: 'b', tex: '3 \\cos(3x + 2y^2)' },
      { id: 'c', tex: '(3 + 4y) \\cos(3x + 2y^2)' },
      { id: 'd', tex: '-4y \\cos(3x + 2y^2)' }
    ],
    correctId: 'a',
    hint: '∂/∂y[sin(u)] = cos(u) · (∂u/∂y) where u = 3x + 2y².',
    steps: [
      {
        title: 'Step 1: Apply Chain Rule w.r.t. y',
        tex: '\\frac{\\partial z}{\\partial y} = \\cos(3x + 2y^2) \\cdot \\frac{\\partial}{\\partial y}(3x + 2y^2) = 4y \\cos(3x + 2y^2)'
      }
    ]
  },
  {
    id: 'mixed-1',
    category: '3. Second-Order Mixed Partials',
    prompt: 'Compute the mixed partial derivative ∂²f / ∂x∂y for:',
    formulaTex: 'f(x, y) = 2x^3 y^2 + e^{xy}',
    questionText: 'Which expression equals ∂²f / ∂x∂y?',
    options: [
      { id: 'a', tex: '12x^2 y + (1 + xy)e^{xy}' },
      { id: 'b', tex: '12x^2 y + xy e^{xy}' },
      { id: 'c', tex: '6x^2 y^2 + y e^{xy}' },
      { id: 'd', tex: '12x y^2 + e^{xy}' }
    ],
    correctId: 'a',
    hint: 'First find ∂f/∂x = 6x²y² + y·e^(xy), then apply ∂/∂y using the Product Rule on y·e^(xy).',
    steps: [
      {
        title: 'Step 1: First-Order Partial f_x',
        tex: 'f_x = 6x^2 y^2 + y e^{xy}'
      },
      {
        title: 'Step 2: Differentiate f_x w.r.t. y',
        tex: 'f_{xy} = 12x^2 y + (1\\cdot e^{xy} + y\\cdot x e^{xy}) = 12x^2 y + (1 + xy)e^{xy}'
      }
    ]
  },
  {
    id: 'mixed-2',
    category: '3. Second-Order Mixed Partials',
    prompt: 'Use Clairaut’s Theorem (f_yx = f_xy) to quickly evaluate:',
    formulaTex: 'f(x, y) = x \\cos(y) + y^4 e^{y^2} \\quad \\Longrightarrow \\quad \\text{Find } \\frac{\\partial^2 f}{\\partial x \\partial y}',
    questionText: 'What is ∂²f / ∂x∂y?',
    options: [
      { id: 'a', tex: '-\\sin(y)' },
      { id: 'b', tex: '\\cos(y) + 4y^3 e^{y^2}' },
      { id: 'c', tex: '\\sin(y)' },
      { id: 'd', tex: '-x \\sin(y)' }
    ],
    correctId: 'a',
    hint: 'Differentiate w.r.t. x first so y⁴e^(y²) vanishes immediately to 0, leaving f_x = cos(y).',
    steps: [
      {
        title: 'Step 1: Differentiate w.r.t. x First, Then y',
        tex: 'f_x = \\cos(y) + 0 = \\cos(y) \\quad \\Longrightarrow \\quad f_{xy} = \\frac{\\partial}{\\partial y}[\\cos(y)] = -\\sin(y)'
      }
    ]
  }
];

function selectFiveBalancedQuestions() {
  const cat1 = QUESTION_BANK.filter((q) => q.category.startsWith('1.'));
  const cat2 = QUESTION_BANK.filter((q) => q.category.startsWith('2.'));
  const cat3 = QUESTION_BANK.filter((q) => q.category.startsWith('3.'));

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  return [
    ...shuffle(cat1).slice(0, 2),
    ...shuffle(cat2).slice(0, 2),
    ...shuffle(cat3).slice(0, 1)
  ];
}

export default function QuizModule() {
  const [questions, setQuestions] = useState(() => QUESTION_BANK.slice(0, 5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedIds, setSubmittedIds] = useState({});
  const [visibleHints, setVisibleHints] = useState({});

  const regenerateQuiz = useCallback(() => {
    setQuestions(selectFiveBalancedQuestions());
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmittedIds({});
    setVisibleHints({});
  }, []);

  const totalSubmitted = Object.keys(submittedIds).length;
  const totalCorrect = questions.reduce(
    (acc, q) => acc + (submittedIds[q.id] && selectedAnswers[q.id] === q.correctId ? 1 : 0),
    0
  );

  const displayedQuestions = viewAll
    ? questions.map((q, idx) => ({ q, idx }))
    : [{ q: questions[currentIdx], idx: currentIdx }];

  return (
    <section className="space-y-4">
      {/* Header & Stepper Toolbar */}
      <div className="border border-border bg-surface p-4 rounded-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
              MODULE 05 // DIAGNOSTIC ASSESSMENT
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
              Multivariable Calculus Verification Quiz
            </h2>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-1 bg-surface-sunken p-1 border border-border rounded">
            {questions.map((q, idx) => {
              const isDone = !!submittedIds[q.id];
              const isRight = isDone && selectedAnswers[q.id] === q.correctId;
              const isCurrent = !viewAll && currentIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setViewAll(false);
                    setCurrentIdx(idx);
                  }}
                  className={`w-7 h-7 rounded text-xs font-mono font-bold transition-colors ${
                    isCurrent
                      ? 'bg-brand text-white'
                      : isDone
                      ? isRight
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                        : 'bg-red-950/60 text-red-400 border border-red-900/50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              );
            })}

            <button
              onClick={() => setViewAll((v) => !v)}
              className="ml-1 px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 rounded border border-border"
            >
              {viewAll ? 'PAGED' : 'ALL 5'}
            </button>
          </div>
        </div>

        {/* Score Readout & Regenerate Button */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 font-mono text-xs text-zinc-300 bg-surface-sunken border border-border rounded">
            SCORE: <span className="text-zinc-100 font-bold">{totalCorrect}/{questions.length}</span>
            <span className="text-zinc-500 ml-1">({totalSubmitted} DONE)</span>
          </div>

          <button
            onClick={regenerateQuiz}
            className="px-3 py-1 font-mono text-xs font-semibold bg-surface-raised hover:bg-zinc-800 text-zinc-200 border border-border rounded transition-colors"
          >
            NEW SET
          </button>
        </div>
      </div>

      {/* Question Card(s) */}
      <div className="space-y-4">
        {displayedQuestions.map(({ q, idx }) => {
          const userChoice = selectedAnswers[q.id];
          const isSubmitted = !!submittedIds[q.id];
          const isCorrect = isSubmitted && userChoice === q.correctId;
          const showHint = !!visibleHints[q.id];

          return (
            <div
              key={q.id}
              className="border border-border bg-surface rounded-md shadow-xs p-4 sm:p-5 space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    PROBLEM {String(idx + 1).padStart(2, '0')} // {q.category}
                  </span>
                </div>

                <button
                  onClick={() => setVisibleHints((p) => ({ ...p, [q.id]: !p[q.id] }))}
                  className="px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-900/50 bg-amber-950/20 rounded hover:bg-amber-950/40 transition-colors"
                >
                  {showHint ? '[HIDE HINT]' : '[HINT]'}
                </button>
              </div>

              {/* Problem Content */}
              <div className="space-y-2">
                <p className="text-xs text-zinc-400 font-mono">{q.prompt}</p>
                <div className="p-3 rounded bg-surface-sunken border border-border-subtle overflow-x-auto text-zinc-100">
                  <MathTex tex={q.formulaTex} block />
                </div>
                <p className="text-sm font-semibold text-zinc-200">
                  {q.questionText}
                </p>
              </div>

              {/* Hint Box */}
              {showHint && (
                <div className="p-2.5 rounded bg-surface-sunken border border-amber-900/40 text-xs font-mono text-amber-300">
                  <strong className="text-amber-400">HINT:</strong> {q.hint}
                </div>
              )}

              {/* Multiple-Choice Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {q.options.map((opt) => {
                  const isSelected = userChoice === opt.id;
                  const isOptionCorrect = opt.id === q.correctId;

                  let borderStyle = 'border-border bg-surface-sunken hover:border-zinc-700';
                  if (isSelected && !isSubmitted) {
                    borderStyle = 'border-brand bg-blue-950/30 ring-1 ring-brand text-zinc-100';
                  } else if (isSubmitted) {
                    if (isOptionCorrect) {
                      borderStyle = 'border-emerald-600 bg-emerald-950/30 text-emerald-300';
                    } else if (isSelected) {
                      borderStyle = 'border-red-600 bg-red-950/30 text-red-300';
                    } else {
                      borderStyle = 'border-border opacity-40';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        !isSubmitted && setSelectedAnswers((p) => ({ ...p, [q.id]: opt.id }))
                      }
                      disabled={isSubmitted}
                      className={`p-3 rounded border text-left font-mono transition-colors flex items-start gap-2.5 ${borderStyle}`}
                    >
                      <span className="font-bold text-xs text-zinc-400 uppercase shrink-0 pt-0.5">
                        [{opt.id.toUpperCase()}]
                      </span>
                      <div className="overflow-x-auto text-xs text-zinc-200 flex-1">
                        <MathTex tex={opt.tex} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action / Validation Strip */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div>
                  {isSubmitted && (
                    <span
                      className={`text-xs font-mono font-bold ${
                        isCorrect ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isCorrect ? '✓ CORRECT RESOLUTION' : '✗ INCORRECT SPECIFICATION'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isSubmitted ? (
                    <button
                      onClick={() => {
                        if (userChoice) {
                          setSubmittedIds((p) => ({ ...p, [q.id]: true }));
                        }
                      }}
                      disabled={!userChoice}
                      className={`px-4 py-1.5 text-xs font-mono font-semibold rounded transition-colors ${
                        userChoice
                          ? 'bg-brand text-white hover:bg-brand-hover'
                          : 'bg-surface-sunken text-zinc-600 border border-border cursor-not-allowed'
                      }`}
                    >
                      VERIFY ANSWER
                    </button>
                  ) : (
                    !viewAll &&
                    currentIdx < questions.length - 1 && (
                      <button
                        onClick={() => setCurrentIdx((i) => i + 1)}
                        className="px-4 py-1.5 text-xs font-mono font-semibold bg-surface-raised hover:bg-zinc-800 text-zinc-200 border border-border rounded transition-colors"
                      >
                        NEXT PROBLEM →
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Derivation Steps (Upon Submission) */}
              {isSubmitted && (
                <div className="mt-3 p-3.5 bg-surface-sunken border border-border rounded space-y-2.5 font-mono text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    FORMAL DERIVATION
                  </div>
                  {q.steps.map((st, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <span className="text-[11px] text-zinc-400 font-semibold">{st.title}</span>
                      <div className="text-zinc-200 overflow-x-auto p-2 bg-surface rounded border border-border-subtle">
                        <MathTex tex={st.tex} block />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
