'use client';

import Link from 'next/link';
import { ActionLink, Panel, Pill, SectionHeader } from '@/components/site';

const stats = [
  { label: 'Total development time', value: '17 hrs' },
  { label: 'Time saved with Bob', value: '60%' },
  { label: 'Session reports', value: '5' },
  { label: 'Lines of code generated', value: '2,500+' },
];

export default function BobPage() {
  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-white/10 bg-[rgba(7,7,7,0.84)] backdrop-blur-xl">
        <div className="site-shell">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="section-kicker">About Bob</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">Built with IBM Bob IDE</h1>
            </div>
            <ActionLink href="/" accent>
              Back to BobForge
            </ActionLink>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-8 py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-8">
            <p className="section-kicker">Overview</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-[color:var(--text)] md:text-6xl">
              How Bob helped shape the app.
            </h2>
            <p className="mt-5 max-w-[60ch] text-sm leading-relaxed text-white/58">
              This page documents the build process and the parts of the product that were accelerated by IBM Bob IDE.
            </p>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((item) => (
              <Panel key={item.label} className="p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{item.value}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <SectionHeader kicker="Contributions" title="What Bob contributed" />
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/58">
              <p>Architecture planning, backend generation, AI integration, and testing support.</p>
              <p>Type-safe code generation across frontend and backend surfaces.</p>
              <p>End-to-end product structure that supported the hackathon demo.</p>
            </div>
          </Panel>
          <Panel className="p-6">
            <SectionHeader kicker="Impact" title="Why it mattered" />
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/58">
              <p>Bob reduced repetitive setup and made it easier to keep the app coherent.</p>
              <p>The generated structure helped the team focus on product quality and polish.</p>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <SectionHeader kicker="Reports" title="Session reports" />
            <div className="mt-5 space-y-3 text-sm">
              {[
                ['Project planning', '/bob_sessions/task-1-project-planning.md'],
                ['Backend implementation', '/bob_sessions/task-2-backend-implementation.md'],
                ['watsonx.ai integration', '/bob_sessions/task-3-watsonx-integration.md'],
                ['Frontend development', '/bob_sessions/task-4-frontend-development.md'],
                ['Testing and polish', '/bob_sessions/task-5-testing-and-polish.md'],
              ].map(([label, href]) => (
                <Link key={label} href={href as string} className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/68 transition hover:bg-white/[0.06]">
                  {label}
                </Link>
              ))}
            </div>
          </Panel>
          <Panel className="p-6">
            <SectionHeader kicker="Summary" title="Development impact" />
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/58">
              <p>Development speed improved materially compared with manual setup.</p>
              <p>Code quality stayed high with TypeScript coverage and testing discipline.</p>
              <p>The result is a clearer, sharper app and a stronger demo story.</p>
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
