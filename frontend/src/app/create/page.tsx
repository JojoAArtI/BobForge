'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { ActionLink, CodeWindow, Panel, Pill, SectionHeader } from '@/components/site';

export default function CreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentation: '',
  });

  const sampleDocs = `API Documentation - HR System

GET /employees/{id}/leave-balance
Returns the current leave balance for an employee
Parameters:
  - id (path, required): Employee ID (e.g., E101, E102)
Response: { employee_id, total_leaves, used_leaves, remaining_leaves }

POST /employees/{id}/leave-request
Submit a new leave request
Parameters:
  - id (path, required): Employee ID
  - start_date (body, required): Leave start date (YYYY-MM-DD)
  - end_date (body, required): Leave end date (YYYY-MM-DD)
  - reason (body, optional): Reason for leave
Response: { request_id, status, message }

GET /employees/{id}/payroll
Get payroll information for an employee
Parameters:
  - id (path, required): Employee ID
Response: { employee_id, salary, bonus, deductions, net_pay }

POST /hr/tickets
Create a new HR support ticket
Parameters:
  - employee_id (body, required): Employee ID
  - category (body, required): Ticket category
  - description (body, required): Issue description
Response: { ticket_id, status, created_at }`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const projectResponse = await api.projects.create({
        name: formData.name,
        description: formData.description,
        apiDocumentation: formData.documentation,
      });

      const projectId = projectResponse.data.data.id;
      await api.endpoints.parse(projectId, {
        documentation: formData.documentation,
      });

      router.push(`/projects/${projectId}/analysis`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
      setLoading(false);
    }
  };

  const loadSample = () => {
    setFormData({
      name: 'HR System API',
      description: 'Employee leave management and payroll system',
      documentation: sampleDocs,
    });
    setUploadedFileName('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const allowedTypes = [
      'text/plain',
      'application/json',
      'application/yaml',
      'application/x-yaml',
      'text/yaml',
      'text/x-yaml',
      'text/markdown',
      'text/html',
      'application/xml',
      'text/xml',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|json|yaml|yml|md|html|xml|openapi|swagger)$/i)) {
      setError('Please upload a valid API documentation file (txt, json, yaml, md, html, xml, openapi, swagger)');
      return;
    }

    try {
      const text = await file.text();
      setFormData({
        ...formData,
        documentation: text,
      });
      setUploadedFileName(file.name);
      setError('');
    } catch {
      setError('Failed to read file');
    }
  };

  const clearFile = () => {
    setFormData({
      ...formData,
      documentation: '',
    });
    setUploadedFileName('');
  };

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-white/10 bg-[rgba(7,7,7,0.84)] backdrop-blur-xl">
        <div className="site-shell">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.22em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Create project</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)] md:text-4xl">
                  Convert any API doc into MCP tools
                </h1>
              </div>
            </div>
            <Pill tone="accent">Unlimited scale</Pill>
          </div>
        </div>
      </header>

      <main className="site-shell py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="space-y-8">
            <SectionHeader
              kicker="Input"
              title="Paste the docs. We’ll do the hard part."
              description="The intake flow is intentionally stripped back so the documentation itself can stay in focus."
            />

            <Panel className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Project signal</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--text)]">
                    No cloud dependency. No fixed limits.
                  </h2>
                  <p className="text-sm leading-relaxed text-white/58">
                    Give BobForge the raw material and it will return a structured project, a risk-aware tool plan, and a deployable export package.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="subtle-frame p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Supports</p>
                    <p className="mt-3 text-sm text-white/68">TXT, JSON, YAML, Markdown, HTML, XML</p>
                  </div>
                  <div className="subtle-frame p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Size</p>
                    <p className="mt-3 text-sm text-white/68">Small specs to large enterprise docs</p>
                  </div>
                </div>
              </div>
            </Panel>

            <CodeWindow title="Workflow preview" subtitle="What happens after submit">
              <div className="space-y-4">
                {[
                  '1. Parse the documentation into structured endpoints',
                  '2. Generate MCP tools with typed input schemas',
                  '3. Assess risk and map approval requirements',
                  '4. Export a complete server with tests',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-0">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                    <p className="text-sm text-white/68">{item}</p>
                  </div>
                ))}
              </div>
            </CodeWindow>
          </section>

          <section className="space-y-6">
            <Panel className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                      Project name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g. HR System API"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                      Description
                    </label>
                    <input
                      id="description"
                      name="description"
                      type="text"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="input"
                      placeholder="Short description of what the API does"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--text)]">
                        API documentation
                      </label>
                      <p className="mt-2 text-sm text-white/50">Upload a file or paste the text directly below.</p>
                    </div>
                    <button type="button" onClick={loadSample} className="btn btn-secondary text-xs uppercase tracking-[0.18em]">
                      Load sample
                    </button>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
                    <label className="mb-3 block text-xs uppercase tracking-[0.24em] text-white/35">
                      Upload file
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="btn btn-primary cursor-pointer text-xs uppercase tracking-[0.18em]">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept=".txt,.json,.yaml,.yml,.md,.html,.xml,.openapi,.swagger"
                          className="hidden"
                        />
                        Choose file
                      </label>
                      {uploadedFileName ? (
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-white/75">
                            {uploadedFileName}
                          </span>
                          <button type="button" onClick={clearFile} className="text-[color:var(--accent)] hover:text-white">
                            Clear
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-white/45">
                          Supported formats: TXT, JSON, YAML, Markdown, HTML, XML, OpenAPI, Swagger
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="documentation" className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                      Paste documentation
                    </label>
                    <textarea
                      id="documentation"
                      name="documentation"
                      required
                      rows={18}
                      value={formData.documentation}
                      onChange={handleChange}
                      className="textarea font-mono text-sm leading-6"
                      placeholder="Paste your API documentation here..."
                    />
                    <p className="mt-2 text-sm text-white/45">
                      Larger specs are fine. The interface stays readable even when the documentation gets long.
                    </p>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[24px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/" className="btn btn-secondary">
                    Cancel
                  </Link>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Analyzing...' : 'Analyze documentation'}
                  </button>
                </div>
              </form>
            </Panel>

            <Panel className="p-6">
              <p className="section-kicker">Next steps</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">What happens after submit</h3>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/60">
                <p>• BobForge parses the documentation with watsonx.ai Granite.</p>
                <p>• Endpoints become MCP tool definitions with typed schemas.</p>
                <p>• Risk assessment decides which operations need approval.</p>
                <p>• The result moves into review, generation, preview, and export.</p>
              </div>
            </Panel>
          </section>
        </div>

        <div className="mt-8">
          <ActionLink href="/" className="inline-flex">
            Back to home
          </ActionLink>
        </div>
      </main>
    </div>
  );
}

// Made with Bob
