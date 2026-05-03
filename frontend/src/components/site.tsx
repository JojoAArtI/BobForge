import Link from 'next/link';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  centered?: boolean;
  action?: ReactNode;
};

export function SectionHeader({
  kicker,
  title,
  description,
  centered = false,
  action,
}: SectionHeaderProps) {
  return (
    <div className={clsx('flex gap-6', centered ? 'flex-col items-center text-center' : 'items-end justify-between')}>
      <div className={clsx('space-y-3', centered ? 'items-center' : '')}>
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        <h2 className="section-title max-w-[12ch]">{title}</h2>
        {description ? <p className="section-copy">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return <div className={clsx('frame', className)}>{children}</div>;
}

type MetricTileProps = {
  label: string;
  value: string;
  detail?: string;
};

export function MetricTile({ label, value, detail }: MetricTileProps) {
  return (
    <div className="subtle-frame p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-relaxed text-white/55">{detail}</p> : null}
    </div>
  );
}

type PillProps = {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'danger';
};

export function Pill({ children, tone = 'default' }: PillProps) {
  const toneClass =
    tone === 'accent'
      ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
      : tone === 'success'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : tone === 'danger'
      ? 'border-red-400/20 bg-red-400/10 text-red-300'
      : 'border-white/10 bg-white/5 text-white/70';

  return <span className={clsx('badge normal-case tracking-[0.16em]', toneClass)}>{children}</span>;
}

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  accent?: boolean;
  className?: string;
};

export function ActionLink({ href, children, accent = false, className }: ActionLinkProps) {
  return (
    <Link href={href} className={clsx('btn', accent ? 'btn-primary' : 'btn-secondary', className)}>
      {children}
    </Link>
  );
}

type CodeWindowProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function CodeWindow({ title, subtitle, children, className }: CodeWindowProps) {
  return (
    <div className={clsx('subtle-frame overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[color:var(--text)]">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-white/45">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5a36]" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="subtle-frame flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <div className="h-3 w-3 rounded-full bg-[color:var(--accent)]" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight text-[color:var(--text)]">{title}</h3>
      <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-white/55">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

type FaqItemProps = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <details className="group border-b border-white/10 py-4">
      <summary className="cursor-pointer list-none text-sm font-medium text-[color:var(--text)] transition hover:text-white">
        <span className="flex items-center justify-between gap-4">
          <span>{question}</span>
          <span className="text-white/40 transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-white/55">{answer}</p>
    </details>
  );
}
