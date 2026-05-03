'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { ActionLink, EmptyState, Panel, Pill, SectionHeader } from '@/components/site';

export default function ExportPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await api.projects.get(projectId);
        setProject(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleDownload = () => {
    setDownloading(true);
    const downloadUrl = api.export.download(projectId);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${project?.name.replace(/\s+/g, '-').toLowerCase()}-mcp-server.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell py-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="h-12 w-3/4 rounded-full bg-white/10" />
              <div className="h-64 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
            <div className="space-y-4">
              <div className="h-32 rounded-[28px] border border-white/10 bg-white/[0.04]" />
              <div className="h-32 rounded-[28px] border border-white/10 bg-white/[0.04]" />
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
          <EmptyState title="Project not found" description="The export step could not load the requested project." action={<ActionLink href="/" accent>Go home</ActionLink>} />
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
              <Link href={`/projects/${projectId}/preview`} className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Export</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{project.name}</h1>
                <p className="mt-2 text-sm text-white/55">Download and deploy the generated server</p>
              </div>
            </div>
            <Pill tone="success">Ready to export</Pill>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-8 py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <Panel className="p-8 text-center">
            <p className="section-kicker">Ready</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-[color:var(--text)] md:text-5xl">
              Your MCP server is ready.
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-sm leading-relaxed text-white/58">
              Download the generated package and deploy it with the included code, tests, and documentation.
            </p>
            <div className="mt-8">
              <button onClick={handleDownload} disabled={downloading} className="btn btn-primary text-base">
                {downloading ? 'Preparing download...' : 'Download ZIP'}
              </button>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel className="p-6">
              <SectionHeader kicker="Included" title="What the export bundle contains" />
              <div className="mt-5 space-y-3">
                {[
                  'Complete MCP server',
                  'Zod schemas for inputs',
                  'Risk policy JSON',
                  'Test suite',
                  'Documentation',
                  'Package configuration',
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-white/10 py-3 text-sm text-white/68 last:border-0">
                    <span>{item}</span>
                    <span className="text-[color:var(--accent)]">Included</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <p className="section-kicker">Quick start</p>
              <div className="mt-5 space-y-3">
                {[
                  'Extract the ZIP file.',
                  'Install dependencies.',
                  'Configure the environment.',
                  'Start the server.',
                ].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
                    <span className="mr-3 text-[color:var(--accent)]">{index + 1}.</span>
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        {error ? <Panel className="border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</Panel> : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <p className="section-kicker">Next steps</p>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/58">
              <p>Configure your API endpoints in the environment file.</p>
              <p>Run the included tests to confirm everything works.</p>
              <p>Connect an AI agent to the server when you are ready.</p>
              <p>Review and approve higher-risk operations as needed.</p>
              <p>Deploy once the server fits your environment.</p>
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="section-kicker">Actions</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/" accent>
                Back to projects
              </ActionLink>
              <ActionLink href={`/projects/${projectId}/playground`}>Test in playground</ActionLink>
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
