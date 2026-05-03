'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Endpoint, Project } from '@/types';
import { ActionLink, CodeWindow, EmptyState, Panel, Pill, SectionHeader } from '@/components/site';

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectRes, endpointsRes] = await Promise.all([
          api.projects.get(projectId),
          api.endpoints.list(projectId),
        ]);

        setProject(projectRes.data.data);
        setEndpoints(endpointsRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleGenerateTools = async () => {
    setGenerating(true);
    setError('');

    try {
      await api.tools.generate(projectId);
      router.push(`/projects/${projectId}/plan`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate tools');
      setGenerating(false);
    }
  };

  const statusTone = project?.status === 'ready' ? 'success' : project?.status === 'draft' ? 'default' : 'accent';

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell py-8">
          <div className="mb-8 h-4 w-28 rounded-full bg-white/10" />
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="h-12 w-3/4 rounded-full bg-white/10" />
              <div className="h-5 w-2/3 rounded-full bg-white/8" />
              <div className="h-64 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-56 rounded-full bg-white/10" />
              <div className="h-28 rounded-[28px] border border-white/10 bg-white/[0.04]" />
              <div className="h-28 rounded-[28px] border border-white/10 bg-white/[0.04]" />
              <div className="h-28 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell flex min-h-[100dvh] items-center justify-center">
          <EmptyState
            title="Project not found"
            description="The project could not be loaded from the current route."
            action={<ActionLink href="/" accent>Go home</ActionLink>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-white/10 bg-[rgba(7,7,7,0.84)] backdrop-blur-xl">
        <div className="site-shell">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Analysis</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{project.name}</h1>
                <p className="mt-2 text-sm text-white/55">{project.description}</p>
              </div>
            </div>
            <Pill tone={statusTone as any}>{project.status}</Pill>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-8 py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel className="p-6">
            <SectionHeader
              kicker="Parsed output"
              title="API documentation parsed successfully."
              description={`Found ${endpoints.length} endpoint${endpoints.length === 1 ? '' : 's'} ready to become MCP tools.`}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Status</p>
                <p className="mt-3 text-sm text-white/68">Structured and ready for tool generation</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Scope</p>
                <p className="mt-3 text-sm text-white/68">Endpoints, parameters, and sensitivity flags</p>
              </div>
            </div>
          </Panel>

          <CodeWindow title="Endpoint summary" subtitle="First pass extraction view">
            <div className="space-y-4">
              {endpoints.slice(0, 4).map((endpoint, index) => (
                <div key={endpoint.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">#{index + 1}</span>
                    <Pill tone="accent">{endpoint.method}</Pill>
                    <code className="font-mono text-sm text-white/78">{endpoint.path}</code>
                    {endpoint.sensitive ? <Pill tone="danger">Sensitive</Pill> : null}
                  </div>
                  {endpoint.description ? <p className="mt-3 text-sm leading-relaxed text-white/55">{endpoint.description}</p> : null}
                </div>
              ))}
              {endpoints.length === 0 ? <p className="text-sm text-white/50">No endpoints were extracted from the source material.</p> : null}
            </div>
          </CodeWindow>
        </section>

        {error ? (
          <Panel className="border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </Panel>
        ) : null}

        <section className="space-y-4">
          <SectionHeader
            kicker="Endpoints"
            title="Extracted endpoints"
            description="The list stays compact and readable so large APIs do not feel like a wall of white cards."
          />

          {endpoints.length === 0 ? (
            <EmptyState
              title="No endpoints found"
              description="Try a different documentation source or parse again after adding more endpoint definitions."
              action={<ActionLink href={`/projects/${projectId}/plan`}>Continue anyway</ActionLink>}
            />
          ) : (
            <div className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <Panel key={endpoint.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">#{index + 1}</span>
                        <Pill tone="accent">{endpoint.method}</Pill>
                        <code className="font-mono text-sm text-white/82">{endpoint.path}</code>
                      </div>
                      {endpoint.description ? <p className="max-w-[70ch] text-sm leading-relaxed text-white/58">{endpoint.description}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill tone="default">{endpoint.operationType}</Pill>
                      {endpoint.sensitive ? <Pill tone="danger">Sensitive</Pill> : null}
                    </div>
                  </div>

                  {endpoint.parameters?.length ? (
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Parameters</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {endpoint.parameters.map((param, idx) => (
                          <span key={idx} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/68">
                            <code className="font-mono text-white/85">{param.name}</code>
                            <span className="mx-2 text-white/30">|</span>
                            {param.type}
                            {param.required ? <span className="ml-2 text-[color:var(--accent)]">*</span> : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Panel>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="section-kicker">Next step</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Generate MCP tools from these endpoints.</h2>
            <p className="mt-2 text-sm text-white/55">The next screen turns this parsed structure into a tool plan with schema details and risk review.</p>
          </div>
          <button onClick={handleGenerateTools} disabled={generating || endpoints.length === 0} className="btn btn-primary">
            {generating ? 'Generating tools...' : 'Generate MCP tools'}
          </button>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
