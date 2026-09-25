import React, { useMemo } from 'react';
import katex from 'katex';

export function MathTex({ tex, block = false, className = '' }) {
  const html = useMemo(() => {
    if (!tex) return '';
    try {
      return katex.renderToString(String(tex), {
        displayMode: block,
        throwOnError: false,
        trust: true,
        strict: false
      });
    } catch {
      return String(tex);
    }
  }, [tex, block]);

  return (
    <span
      className={`${block ? 'block my-0.5 overflow-x-auto' : 'inline-block align-middle'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function FormulaCard({
  title,
  subtitle,
  badge,
  badgeColor = 'primary',
  tex,
  secondaryTex,
  explanation,
  className = ''
}) {
  const badgeStyles = {
    primary: 'bg-[#182b24] text-[#52b788] border-[#52b788]/30',
    cyan: 'bg-[#182b24] text-[#52b788] border-[#52b788]/30',
    emerald: 'bg-[#182b24] text-[#52b788] border-[#52b788]/30',
    amber: 'bg-[#4a3b10]/50 text-[#e7c268] border-[#e7c268]/30',
    tertiary: 'bg-[#4a3b10]/50 text-[#e7c268] border-[#e7c268]/30',
    purple: 'bg-[#15221f] text-[#8fe2b7] border-[#23352f]'
  };

  return (
    <div
      className={`rounded-xl border border-[#23352f] bg-[#111b18] p-5 shadow-lg shadow-black/20 hover:border-[#52b788]/40 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="font-headline text-sm font-bold text-[#e2ece9]">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-[#6d857d] mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
              badgeStyles[badgeColor] || badgeStyles.primary
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {tex && (
        <div className="p-3 rounded-lg bg-[#15221f] border border-[#23352f] text-sm text-[#e2ece9] overflow-x-auto">
          <MathTex tex={tex} block />
          {secondaryTex && (
            <div className="mt-1.5 pt-1.5 border-t border-[#23352f] text-xs text-[#9cb3ab] font-mono">
              <MathTex tex={secondaryTex} />
            </div>
          )}
        </div>
      )}

      {explanation && (
        <p className="mt-2.5 text-xs text-[#9cb3ab] leading-relaxed">
          {explanation}
        </p>
      )}
    </div>
  );
}
