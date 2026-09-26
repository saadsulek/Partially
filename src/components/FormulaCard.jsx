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
  badgeType = 'default',
  tex,
  secondaryTex,
  explanation,
  className = ''
}) {
  const badgeClasses = {
    default: 'text-zinc-400 bg-zinc-900 border-zinc-800',
    primary: 'text-brand-text bg-blue-950/40 border-blue-900/50',
    x: 'text-sky-400 bg-sky-950/30 border-sky-900/50',
    y: 'text-amber-400 bg-amber-950/30 border-amber-900/50',
  };

  const selectedBadgeClass = badgeClasses[badgeType] || badgeClasses.default;

  return (
    <div
      className={`border border-border bg-surface p-4 rounded-md shadow-xs hover:border-border-strong transition-colors ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <h4 className="font-serif text-sm font-semibold text-zinc-100 tracking-tight">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border shrink-0 ${selectedBadgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="bg-surface-sunken border border-border-subtle p-3 rounded my-2.5 overflow-x-auto text-zinc-100">
        <MathTex tex={tex} block />
      </div>

      {secondaryTex && (
        <div className="bg-surface-sunken/60 border border-border-subtle/60 p-2.5 rounded my-2 overflow-x-auto text-zinc-300 text-xs">
          <MathTex tex={secondaryTex} block />
        </div>
      )}

      {explanation && (
        <p className="text-xs text-zinc-400 leading-relaxed mt-2.5 pt-2.5 border-t border-border-subtle">
          {explanation}
        </p>
      )}
    </div>
  );
}
