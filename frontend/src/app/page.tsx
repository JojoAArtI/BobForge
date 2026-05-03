'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { ActionLink, CodeWindow, EmptyState, MetricTile, Panel, Pill, SectionHeader } from '@/components/site';

const heroMetrics = [
  { label: 'Pipeline', value: 'One pass', detail: 'Parse docs, generate tools, assess risk, export code.' },
  { label: 'Execution', value: 'Local only', detail: 'No cloud dependency in the generated MCP layer.' },
  { label: 'Control', value: 'Human-gated', detail: 'Approvals stay visible before risky actions run.' },
  { label: 'Delivery', value: 'Production-ready', detail: 'TypeScript output with tests and documentation.' },
];

const principles = [
  {
    title: 'Everything stays local',
    body: 'The product promises a clean path from API docs to agent-ready tools without pushing the core runtime into a remote black box.',
  },
  {
    title: 'Control beats automation',
    body: 'High-risk operations stay visible, explainable, and reviewable so teams can trust the workflow instead of guessing at it.',
  },
  {
    title: 'Scale is visible, not noisy',
    body: 'Large APIs, many endpoints, and long pipelines are expressed with clear structure rather than dense dashboards or heavy chrome.',
  },
  {
    title: 'Fast to understand',
    body: 'The page hierarchy is intentionally sharp: headline, proof, feature story, project list, then next action.',
  },
];

const workFlow = [
  {
    step: '01',
    title: 'Paste or upload API docs',
    body: 'Bring in OpenAPI, Markdown, YAML, JSON, or raw text and let the parser do the first pass.',
  },
  {
    step: '02',
    title: 'Extract endpoints and policy',
    body: 'Endpoints are converted into structured tools, then risk is assigned before anything is executed.',
  },
  {
    step: '03',
    title: 'Review, generate, export',
    body: 'The output lands in a readable plan, then becomes code, tests, and a downloadable MCP package.',
  },
];

function ProjectCard({ project }: { project: Project }) {
  const tone =
    project.status === 'draft'
      ? 'default'
      : project.status === 'analyzing'
      ? 'accent'
      : project.status === 'ready'
      ? 'success'
      : 'danger';

  return (
    <Link href={`/projects/${project.id}/analysis`} className="group block">
      <Panel className="h-full p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Project</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--text)]">{project.name}</h3>
          </div>
          <Pill tone={tone as any}>{project.status}</Pill>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/60">{project.description}</p>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/40">
          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          <span className="text-[color:var(--accent)] transition group-hover:translate-x-1">Open</span>
        </div>
      </Panel>
    </Link>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.projects.list();
        setProjects(response.data.data || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(7,7,7,0.84)] backdrop-blur-xl">
        <div className="site-shell">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold tracking-[0.2em] text-[color:var(--text)] transition group-hover:border-[color:var(--accent-border)] group-hover:text-white">
                BF
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-[color:var(--text)]">BobForge</p>
                <p className="text-xs text-white/45">API documentation to MCP tools</p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <Pill tone="accent">On-device workflow</Pill>
              <ActionLink href="/create" accent>
                Create project
              </ActionLink>
            </div>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-24 py-8 md:space-y-32 md:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-8">
            <div className="space-y-4">
              <Pill tone="accent">On-device AI coding</Pill>
              <h1 className="max-w-[9ch] text-5xl font-semibold tracking-tighter text-[color:var(--text)] md:text-7xl">
                No cloud. No limits.
              </h1>
              <p className="section-copy max-w-[56ch] text-base md:text-lg">
                BobForge turns raw API documentation into secure MCP tooling with a dark, controlled interface that puts the workflow, risk, and output in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionLink href="/create" accent>
                Start a new project
              </ActionLink>
              <ActionLink href="#projects">View projects</ActionLink>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {heroMetrics.map((metric) => (
                <MetricTile key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
              ))}
            </div>
          </div>

          <Panel className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,90,54,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_36%)]" />
            <div className="relative p-6 md:p-7">
              <CodeWindow title="BobForge runtime" subtitle="Local pipeline snapshot">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/35">
                      <span>Input</span>
                      <span className="text-[color:var(--accent)]">Parsed</span>
                    </div>
                    <p className="mt-4 font-mono text-[13px] leading-6 text-white/80">
                      GET /employees {'{'}id{'}'}/leave-balance
                      <br />
                      POST /employees {'{'}id{'}'}/leave-request
                      <br />
                      DELETE /hr/tickets/{'{'}ticketId{'}'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Tools</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tighter text-[color:var(--text)]">18</p>
                    </div>
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Risk</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tighter text-[color:var(--text)]">4</p>
                    </div>
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Ready</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tighter text-[color:var(--text)]">yes</p>
                    </div>
                  </div>

                  <div className="subtle-frame p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/35">
                      <span>Safety gate</span>
                      <span>Human approval required</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/8">
                      <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#ff5a36,#ff7c59)]" />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                      High-risk operations stay visible, explainable, and ready for approval before any execution step is allowed through.
                    </p>
                  </div>
                </div>
              </CodeWindow>
            </div>
          </Panel>
        </section>

        <section className="space-y-8">
          <SectionHeader
            kicker="Why it feels different"
            title="You do not own your AI if you cannot see it."
            description="The redesign keeps the product dark, direct, and specific. No bright app chrome, no generic dashboard cards, and no loose visual noise competing with the workflow."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item) => (
              <Panel key={item.title} className="p-6">
                <p className="section-kicker">Principle</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-[color:var(--text)]">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/58">{item.body}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-6">
            <SectionHeader
              kicker="System view"
              title="Everything local. Own your AI."
              description="This app intentionally reads like a system console. The darker palette, thin separators, and sparse copy all point to the same message: control stays with the user."
            />
            <div className="mt-8 space-y-4">
              {[
                ['Parse', 'Documentation becomes structured endpoints.'],
                ['Convert', 'Endpoints turn into safe MCP tool definitions.'],
                ['Review', 'Risk policy stays visible before execution.'],
                ['Export', 'The final server is bundled for deployment.'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-white/10 py-3">
                  <span className="text-sm uppercase tracking-[0.24em] text-white/35">{label}</span>
                  <span className="max-w-[24ch] text-right text-sm text-white/68">{value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="p-6">
              <p className="section-kicker">Local runtime</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">No cloud path required</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/58">
                The generated MCP server is designed to live beside the project, not behind a hidden service layer.
              </p>
            </Panel>
            <Panel className="p-6">
              <p className="section-kicker">Governance</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Approval stays explicit</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/58">
                Sensitive actions are visible in the UI so teams can review them before they move forward.
              </p>
            </Panel>
            <Panel className="p-6 md:col-span-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricTile label="Latency" value="Predictable" detail="Batch processing keeps large docs readable and organized." />
                <MetricTile label="Scale" value="Wide" detail="Works from small API snippets to large enterprise specs." />
                <MetricTile label="Mode" value="Focused" detail="The layout avoids generic SaaS clutter and keeps the path clear." />
              </div>
            </Panel>
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            kicker="Workflow"
            title="Purpose beats scale."
            description="The structure mirrors the reference image's tension: bold headline, grid proof, then a calm explanation of why the product exists."
          />

          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <Panel className="p-6">
              <div className="space-y-5">
                {workFlow.map((item) => (
                  <div key={item.step} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">{item.step}</span>
                      <span className="h-px flex-1 bg-white/10 ml-4" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--text)]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/58">{item.body}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <CodeWindow title="Control surface" subtitle="What the user sees before code generation">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Input source</p>
                      <p className="mt-3 text-sm text-white/68">Docs, JSON, YAML, Markdown, HTML, XML</p>
                    </div>
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Policy</p>
                      <p className="mt-3 text-sm text-white/68">Automatic risk review with human approval gates</p>
                    </div>
                  </div>
                  <div className="subtle-frame p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Output</p>
                    <p className="mt-3 font-mono text-[13px] leading-6 text-white/80">
                      /src
                      <br />
                      /tests
                      <br />
                      /policy
                      <br />
                      README.md
                    </p>
                  </div>
                </div>
              </CodeWindow>
            </Panel>
          </div>
        </section>

        <section id="projects" className="space-y-8">
          <SectionHeader
            kicker="Projects"
            title="Your machine, unleashed."
            description="Existing projects are treated as operational objects, not marketing cards. The list stays compact, dark, and easy to scan."
          />

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Panel key={index} className="p-5">
                  <div className="h-3 w-24 rounded-full bg-white/10" />
                  <div className="mt-5 h-7 w-3/4 rounded-full bg-white/10" />
                  <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
                  <div className="mt-2 h-4 w-5/6 rounded-full bg-white/8" />
                  <div className="mt-6 h-px bg-white/10" />
                  <div className="mt-4 h-3 w-32 rounded-full bg-white/10" />
                </Panel>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start turning API documentation into MCP tools."
              action={<ActionLink href="/create" accent>Create your first project</ActionLink>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-8">
          <SectionHeader
            kicker="FAQ"
            title="Frequently asked questions."
            description="This section keeps the tone spare and factual, matching the restraint of the reference while still answering the obvious questions."
          />
          <Panel className="p-6">
            <FaqStack />
          </Panel>
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,90,54,0.14),rgba(255,90,54,0.04)_38%,rgba(255,255,255,0.02)_100%)] px-6 py-14 md:px-10 md:py-20">
          <div className="absolute inset-x-0 bottom-[-30%] top-[-10%] opacity-70">
            <div className="absolute inset-x-[-15%] bottom-0 top-[20%] rounded-full border border-white/10" />
            <div className="absolute inset-x-[-5%] bottom-[-12%] top-[36%] rounded-full border border-white/10" />
            <div className="absolute inset-x-[8%] bottom-[-15%] top-[48%] rounded-full border border-white/10" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <Pill tone="accent">Break free from big AI</Pill>
            <h2 className="mt-6 max-w-[10ch] text-5xl font-semibold tracking-tighter text-[color:var(--text)] md:text-7xl">
              Break free from big AI
            </h2>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-white/64 md:text-lg">
              Build, inspect, and ship MCP tooling with a frontend that feels as controlled as the backend it produces.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink href="/create" accent>
                Request Bob access
              </ActionLink>
              <ActionLink href="/bob">See the development story</ActionLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="site-shell py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-tight text-[color:var(--text)]">BobForge</p>
              <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-white/45">
                Built for the IBM Bob Dev Day hackathon. Powered by watsonx.ai Granite and a heavily simplified UI
                system.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/30">Local-first product interface</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqStack() {
  const questions = [
    {
      question: 'What does BobForge generate?',
      answer:
        'It converts API documentation into MCP tools, risk policies, generated code, tests, and a deployable export package.',
    },
    {
      question: 'Does it support large documentation sets?',
      answer:
        'Yes. The workflow is built for large docs and long endpoint lists without forcing the interface to become cluttered or hard to scan.',
    },
    {
      question: 'Where does approval happen?',
      answer:
        'Approval remains visible in the risk and playground stages so teams can review sensitive actions before they execute.',
    },
    {
      question: 'Is the new design mobile friendly?',
      answer:
        'Yes. The layout collapses to a strict single-column flow on smaller screens and keeps the typography readable at every breakpoint.',
    },
  ];

  return (
    <div>
      {questions.map((item) => (
        <div key={item.question} className="border-b border-white/10 py-4 last:border-0">
          <p className="text-sm font-medium text-[color:var(--text)]">{item.question}</p>
          <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-white/56">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

// Made with Bob
