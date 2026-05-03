'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, RiskPolicy } from '@/types';
import { ActionLink, EmptyState, Panel, Pill, SectionHeader } from '@/components/site';

export default function RiskReviewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [policy, setPolicy] = useState<RiskPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectRes, policyRes] = await Promise.all([
          api.projects.get(projectId),
          api.risk.getPolicy(projectId),
        ]);

        setProject(projectRes.data.data);
        setPolicy(policyRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    setError('');

    try {
      await api.generate.code(projectId);
      router.push(`/projects/${projectId}/preview`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate code');
      setGenerating(false);
    }
  };

  const getRiskTone = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'accent';
      case 'HIGH':
        return 'danger';
      case 'CRITICAL':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getToolNameFromRule = (condition: string) => {
    const match = condition.match(/tool\.name === '([^']+)'/);
    return match ? match[1] : condition;
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell py-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div className="h-12 w-3/4 rounded-full bg-white/10" />
              <div className="h-28 rounded-[28px] border border-white/10 bg-white/[0.04]" />
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

  if (!project || !policy) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell flex min-h-[100dvh] items-center justify-center">
          <EmptyState title="Data not found" description="The project or risk policy could not be loaded." action={<ActionLink href="/" accent>Go home</ActionLink>} />
        </div>
      </div>
    );
  }

  const riskCounts = {
    LOW: policy.rules?.filter((rule) => rule.riskLevel === 'LOW').length || 0,
    MEDIUM: policy.rules?.filter((rule) => rule.riskLevel === 'MEDIUM').length || 0,
    HIGH: policy.rules?.filter((rule) => rule.riskLevel === 'HIGH').length || 0,
    CRITICAL: policy.rules?.filter((rule) => rule.riskLevel === 'CRITICAL').length || 0,
  };

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-white/10 bg-[rgba(7,7,7,0.84)] backdrop-blur-xl">
        <div className="site-shell">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/plan`} className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Risk review</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{project.name}</h1>
                <p className="mt-2 text-sm text-white/55">Risk assessment and policy summary</p>
              </div>
            </div>
            <Pill tone="accent">{project.status}</Pill>
          </div>
        </div>
      </header>

      <main className="site-shell space-y-8 py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel className="p-6">
            <SectionHeader
              kicker="Safety"
              title="Risk assessment complete."
              description={`${policy.rules?.length || 0} rule${(policy.rules?.length || 0) === 1 ? '' : 's'} were classified with approval guidance.`}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Policy shape</p>
                <p className="mt-3 text-sm text-white/68">Low, medium, high, and critical risk bands</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Approval</p>
                <p className="mt-3 text-sm text-white/68">High-risk actions stay gated for review</p>
              </div>
            </div>
          </Panel>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Panel className="p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Low</p>
              <p className="mt-4 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{riskCounts.LOW}</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Medium</p>
              <p className="mt-4 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{riskCounts.MEDIUM}</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">High</p>
              <p className="mt-4 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{riskCounts.HIGH}</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Critical</p>
              <p className="mt-4 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{riskCounts.CRITICAL}</p>
            </Panel>
          </div>
        </section>

        {error ? <Panel className="border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</Panel> : null}

        <section className="space-y-4">
          <SectionHeader
            kicker="Tools"
            title="Tool risk assessment"
            description="Each tool is shown with its risk band and approval requirement so the policy is easy to inspect."
          />

          {policy.rules?.length ? (
            <div className="space-y-4">
              {policy.rules.map((rule) => (
                <Panel key={rule.condition} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Pill tone={getRiskTone(rule.riskLevel) as any}>{rule.riskLevel}</Pill>
                        <h3 className="text-xl font-semibold tracking-tight text-[color:var(--text)]">{getToolNameFromRule(rule.condition)}</h3>
                      </div>
                      <p className="max-w-[70ch] text-sm leading-relaxed text-white/58">{rule.reason}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      {rule.approvalRequired ? <Pill tone="accent">Approval required</Pill> : <Pill tone="success">No approval required</Pill>}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Risk level</p>
                      <p className="mt-3 text-sm text-white/68">{rule.riskLevel}</p>
                    </div>
                    <div className="subtle-frame p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Approval</p>
                      <p className="mt-3 text-sm text-white/68">{rule.approvalRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          ) : (
            <EmptyState title="No policy rules found" description="Risk policy could not find any rules to classify." action={<ActionLink href={`/projects/${projectId}/plan`}>Return to plan</ActionLink>} />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Panel className="p-6">
            <p className="section-kicker">Policy summary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Enterprise safety</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Project ID</p>
                <p className="mt-3 font-mono text-xs text-white/75">{policy.projectId}</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Total tools</p>
                <p className="mt-3 text-sm text-white/68">{policy.rules?.length || 0}</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Requires approval</p>
                <p className="mt-3 text-sm text-white/68">{policy.rules?.filter((rule) => rule.approvalRequired).length || 0}</p>
              </div>
              <div className="subtle-frame p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Created</p>
                <p className="mt-3 text-sm text-white/68">{new Date(policy.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="section-kicker">Risk legend</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">How the bands work</h2>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/60">
              <p>Low: safe read operations and non-sensitive data.</p>
              <p>Medium: reads that expose sensitive information.</p>
              <p>High: write operations that can change state.</p>
              <p>Critical: destructive or financially sensitive actions.</p>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="section-kicker">Next step</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Generate the final server code.</h2>
            <p className="mt-2 text-sm text-white/55">Once the risk policy looks right, the next step is code generation and preview.</p>
          </div>
          <button onClick={handleGenerateCode} disabled={generating} className="btn btn-primary">
            {generating ? 'Generating code...' : 'Generate code'}
          </button>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
