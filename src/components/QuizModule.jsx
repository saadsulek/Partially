import React, { useState, useCallback } from 'react';
import { MathTex } from './FormulaCard';

const QUESTION_BANK = [
  {
    id: 'const-1',
    category: '1. Identifying Constant Terms',
    prompt: 'When computing the first-order partial derivative with respect to x:',
    formulaTex: '\\frac{\\partial}{\\partial {\\textcolor{#52b788}{x}}}\\Big[ 4x^3 y^2 - 7y^4 \\cos(y) + 9x - e^{2y} \\Big]',
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
        tex: '\\text{Active: } {\\textcolor{#52b788}{x}} \\quad | \\quad \\text{Held constant: } {\\textcolor{#e7c268}{y}}'
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
    <section className="space-y-6">
      {/* Header & Question Stepper Bar */}
      <div className="bg-[#111b18] border border-[#23352f] rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-headline text-xl font-bold text-[#e2ece9]">
            Practice Modules • Self-Quiz
          </h2>

          <div className="flex items-center gap-1.5">
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
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold border transition-all ${
                    isCurrent
                      ? 'bg-primary text-[#003823] border-primary shadow-[0_0_10px_rgba(82,183,136,0.3)]'
                      : isDone
                      ? isRight
                        ? 'bg-[#182b24] border-primary/40 text-primary'
                        : 'bg-[#520d11] border-[#ff8577]/40 text-[#ff8577]'
                      : 'bg-[#15221f] border-[#23352f] text-[#9cb3ab]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}

            <button
              onClick={() => setViewAll((v) => !v)}
              className={`ml-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                viewAll
                  ? 'bg-[#182b24] border-primary/40 text-primary font-semibold'
                  : 'bg-[#15221f] border-[#23352f] text-[#9cb3ab]'
              }`}
            >
              {viewAll ? 'Single View' : 'Show All 5'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#9cb3ab] px-3 py-1.5 rounded-lg bg-[#15221f] border border-[#23352f]">
            Score: <span className="text-primary">{totalCorrect}/{questions.length}</span> ({totalSubmitted} answered)
          </span>

          <button
            onClick={regenerateQuiz}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-[#003823] hover:bg-[#74c69d] text-xs font-bold shadow-[0_0_10px_rgba(82,183,136,0.25)] transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            New Set
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
              className="bg-[#111b18] rounded-xl border border-[#23352f] p-5 shadow-lg shadow-black/20 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#182b24] border border-primary/30 font-mono text-xs font-bold text-primary">
                    Problem {idx + 1} of {questions.length}
                  </span>
                  <span className="text-xs font-medium text-[#9cb3ab]">
                    {q.category}
                  </span>
                </div>

                <button
                  onClick={() => setVisibleHints((p) => ({ ...p, [q.id]: !p[q.id] }))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#4a3b10]/50 text-tertiary border border-tertiary/30"
                >
                  <span className="material-symbols-outlined text-sm">lightbulb</span>
                  {showHint ? 'Hide Hint' : 'Hint'}
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs text-[#9cb3ab]">{q.prompt}</p>
                <div className="p-4 rounded-lg bg-[#15221f] border border-[#23352f] overflow-x-auto">
                  <MathTex tex={q.formulaTex} block />
                </div>
                <p className="text-sm font-semibold text-[#e2ece9]">
                  {q.questionText}
                </p>
              </div>

              {showHint && (
                <div className="p-3 rounded-lg bg-[#4a3b10]/30 border border-tertiary/30 text-xs text-tertiary">
                  <strong>Hint:</strong> {q.hint}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt) => {
                  const isSelected = userChoice === opt.id;
                  const isOptionCorrect = opt.id === q.correctId;

                  let style =
                    'border-[#23352f] bg-[#15221f] hover:border-primary/40';
                  if (isSelected && !isSubmitted) {
                    style = 'border-primary bg-[#182b24]';
                  } else if (isSubmitted) {
                    if (isOptionCorrect) {
                      style = 'border-primary bg-[#182b24]';
                    } else if (isSelected) {
                      style = 'border-[#ff8577] bg-[#520d11]/40';
                    } else {
                      style = 'border-[#23352f] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        !isSubmitted && setSelectedAnswers((p) => ({ ...p, [q.id]: opt.id }))
                      }
                      disabled={isSubmitted}
                      className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-center gap-2.5 overflow-x-auto">
                        <span className="w-6 h-6 rounded-full border border-[#6d857d] text-xs font-mono font-bold flex items-center justify-center shrink-0 uppercase text-[#e2ece9]">
                          {opt.id}
                        </span>
                        <span className="text-sm text-[#e2ece9]">
                          <MathTex tex={opt.tex} />
                        </span>
                      </div>

                      {isSubmitted && isOptionCorrect && (
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      )}
                      {isSubmitted && isSelected && !isOptionCorrect && (
                        <span className="material-symbols-outlined text-[#ff8577]">cancel</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                {!viewAll ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                      disabled={currentIdx === 0}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#15221f] border border-[#23352f] text-[#9cb3ab] hover:text-[#e2ece9] disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                      disabled={currentIdx === questions.length - 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#15221f] border border-[#23352f] text-[#9cb3ab] hover:text-[#e2ece9] disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                {!isSubmitted && (
                  <button
                    onClick={() =>
                      userChoice && setSubmittedIds((p) => ({ ...p, [q.id]: true }))
                    }
                    disabled={!userChoice}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      userChoice
                        ? 'bg-primary hover:bg-[#74c69d] text-[#003823] shadow-[0_0_10px_rgba(82,183,136,0.25)]'
                        : 'bg-[#15221f] text-[#6d857d] cursor-not-allowed'
                    }`}
                  >
                    Submit Answer
                  </button>
                )}
              </div>

              {isSubmitted && (
                <div className="pt-3 border-t border-[#23352f] space-y-2.5">
                  <div
                    className={`text-xs font-semibold flex items-center gap-1.5 ${
                      isCorrect ? 'text-primary' : 'text-[#ff8577]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                    {isCorrect
                      ? 'Correct!'
                      : `Incorrect — Option (${q.correctId.toUpperCase()}) is correct.`}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {q.steps.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-lg bg-[#15221f] border border-[#23352f] text-xs"
                      >
                        <div className="font-semibold text-primary mb-1">{st.title}</div>
                        <MathTex tex={st.tex} block />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
