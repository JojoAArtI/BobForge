'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { GeneratedFiles, Project } from '@/types';
import { ActionLink, EmptyState, Panel, Pill, SectionHeader } from '@/components/site';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<GeneratedFiles | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectRes, filesRes] = await Promise.all([
          api.projects.get(projectId),
          api.generate.preview(projectId),
        ]);

        setProject(projectRes.data.data);
        setFiles(filesRes.data.data);

        if (filesRes.data.data?.files?.length > 0) {
          setSelectedFile(filesRes.data.data.files[0].path);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleExport = () => {
    router.push(`/projects/${projectId}/export`);
  };

  const currentFile = files?.files.find((file) => file.path === selectedFile);

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell py-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="h-12 w-3/4 rounded-full bg-white/10" />
              <div className="h-64 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-56 rounded-full bg-white/10" />
              <div className="h-80 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !files) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell flex min-h-[100dvh] items-center justify-center">
          <EmptyState
            title="Data not found"
            description="The generated preview could not be loaded."
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
              <Link href={`/projects/${projectId}/risk`} className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Preview</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{project.name}</h1>
                <p className="mt-2 text-sm text-white/55">Code preview and generated file structure</p>
              </div>
            </div>
            <Pill tone="success">Generated</Pill>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-8 py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Panel className="p-6">
            <SectionHeader
              kicker="Output"
              title="MCP server generated successfully."
              description={`${files.files.length} file${files.files.length === 1 ? '' : 's'} are ready to inspect and export.`}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Structure</p>
                <p className="mt-3 text-sm text-white/68">Readable, testable, and exportable output</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Use</p>
                <p className="mt-3 text-sm text-white/68">Browse files, inspect code, then export</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeader
              kicker="Project"
              title="Project structure"
              description="The file tree stays up top so the build shape is the first thing you see."
            />
            <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-black/35">
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-white/78">{files.structure.join('\n')}</pre>
            </div>
          </Panel>
        </section>

        {error ? <Panel className="border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</Panel> : null}

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel className="p-6">
            <SectionHeader
              kicker="Files"
              title="Files"
              description="Browse the generated files here and switch between outputs without leaving the preview."
            />
            <div className="mt-5 space-y-2">
              {files.files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file.path)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedFile === file.path
                      ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-soft)]'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-white/78">{file.path}</span>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-white/35">{file.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Selected file</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">{currentFile?.path || 'Select a file'}</h2>
              </div>
              <Pill tone="default">{currentFile?.type || 'unknown'}</Pill>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-black/35">
              {currentFile ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--text)]">{currentFile.path}</p>
                      <p className="mt-1 text-xs text-white/45">Selected file preview</p>
                    </div>
                    <Pill tone="default">{currentFile.type}</Pill>
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-white/82">
                    <code>{currentFile.content}</code>
                  </pre>
                </>
              ) : (
                <div className="p-8">
                  <EmptyState title="No file selected" description="Choose a file from the file browser to inspect its contents." />
                </div>
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <p className="section-kicker">Next step</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Test the generated tools in the playground.</h3>
            <p className="mt-2 text-sm text-white/55">Use the interactive agent flow to exercise the generated MCP server before export.</p>
            <div className="mt-5">
              <ActionLink href={`/projects/${projectId}/playground`}>Open playground</ActionLink>
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="section-kicker">Export</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Download the server package.</h3>
            <p className="mt-2 text-sm text-white/55">The export step bundles the generated files into a ZIP archive for deployment.</p>
            <div className="mt-5">
              <button onClick={handleExport} className="btn btn-primary">
                Download ZIP
              </button>
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
