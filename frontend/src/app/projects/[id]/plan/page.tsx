'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MCPTool, Project } from '@/types';
import { ActionLink, CodeWindow, EmptyState, Panel, Pill, SectionHeader } from '@/components/site';

export default function ToolPlanPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectRes, toolsRes] = await Promise.all([
          api.projects.get(projectId),
          api.tools.list(projectId),
        ]);

        setProject(projectRes.data.data);
        setTools(toolsRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleAssessRisk = async () => {
    setAssessing(true);
    setError('');

    try {
      await api.risk.assess(projectId);
      router.push(`/projects/${projectId}/risk`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assess risk');
      setAssessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell py-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="h-12 w-3/4 rounded-full bg-white/10" />
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
          <EmptyState title="Project not found" description="The requested project could not be loaded." action={<ActionLink href="/" accent>Go home</ActionLink>} />
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
              <Link href={`/projects/${projectId}/analysis`} className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Tool plan</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{project.name}</h1>
                <p className="mt-2 text-sm text-white/55">Generated MCP tool definitions and input schemas</p>
              </div>
            </div>
            <Pill tone="accent">{project.status}</Pill>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-8 py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-6">
            <SectionHeader
              kicker="Plan"
              title="MCP tools generated successfully."
              description={`${tools.length} tool${tools.length === 1 ? '' : 's'} are ready for risk assessment.`}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Focus</p>
                <p className="mt-3 text-sm text-white/68">Readable tool names, explicit inputs, controlled execution</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Output</p>
                <p className="mt-3 text-sm text-white/68">Schemas, descriptions, and source references</p>
              </div>
            </div>
          </Panel>

          <CodeWindow title="Schema preview" subtitle="Input model snapshot">
            <div className="space-y-4">
              {tools.slice(0, 3).map((tool, index) => (
                <div key={tool.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">#{index + 1}</span>
                    <Pill tone="accent">{tool.name}</Pill>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{tool.description}</p>
                </div>
              ))}
              {tools.length === 0 ? <p className="text-sm text-white/50">No tools were generated yet.</p> : null}
            </div>
          </CodeWindow>
        </section>

        {error ? <Panel className="border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</Panel> : null}

        <section className="space-y-4">
          <SectionHeader
            kicker="Generated tools"
            title="Generated MCP tools"
            description="The list is deliberately dense but not boxed-in, keeping the control room feel without generic card clutter."
          />

          {tools.length === 0 ? (
            <EmptyState
              title="No tools generated"
              description="Generate tools from the analysis screen first, then return here to review the tool definitions."
              action={<ActionLink href={`/projects/${projectId}/analysis`}>Go to analysis</ActionLink>}
            />
          ) : (
            <div className="space-y-4">
              {tools.map((tool, index) => (
                <Panel key={tool.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">#{index + 1}</span>
                        <Pill tone="accent">{tool.name}</Pill>
                      </div>
                      <p className="max-w-[70ch] text-sm leading-relaxed text-white/58">{tool.description}</p>
                    </div>
                    <Pill tone="default">MCP tool</Pill>
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Input schema</p>
                    <div className="mt-3 overflow-hidden rounded-[24px] border border-white/10 bg-black/30 p-4">
                      <pre className="overflow-x-auto font-mono text-xs leading-6 text-white/76">
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {tool.endpointId ? <p className="mt-4 text-xs uppercase tracking-[0.24em] text-white/35">Source endpoint: {tool.endpointId}</p> : null}
                </Panel>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="section-kicker">Next step</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Assess risk for each tool.</h2>
            <p className="mt-2 text-sm text-white/55">Once the plan is reviewed, the risk screen will classify the tools and show approval gates.</p>
          </div>
          <button onClick={handleAssessRisk} disabled={assessing || tools.length === 0} className="btn btn-primary">
            {assessing ? 'Assessing risk...' : 'Assess risk'}
          </button>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
