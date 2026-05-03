'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AgentResponse, Approval, Project } from '@/types';
import { ActionLink, EmptyState, Panel, Pill, SectionHeader } from '@/components/site';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  response?: AgentResponse;
}

export default function PlaygroundPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectRes, approvalsRes] = await Promise.all([
          api.projects.get(projectId),
          api.approvals.list(projectId, 'pending'),
        ]);

        setProject(projectRes.data.data);
        setApprovals(approvalsRes.data.data || []);
        setMessages([
          {
            id: '1',
            type: 'agent',
            content:
              'Hello. I can help you exercise the generated MCP tools. Try asking for leave balance, payroll information, or an HR ticket action.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const response = await api.agent.query(projectId, input);
      const agentResponse: AgentResponse = response.data.data;

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentResponse.message,
        timestamp: agentResponse.timestamp,
        response: agentResponse,
      };

      setMessages((prev) => [...prev, agentMessage]);

      if (agentResponse.approvalRequired) {
        const approvalsRes = await api.approvals.list(projectId, 'pending');
        setApprovals(approvalsRes.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: 'Sorry, the request could not be processed right now.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await api.approvals.approve(approvalId, 'user@example.com', 'Approved from playground');
      const approvalsRes = await api.approvals.list(projectId, 'pending');
      setApprovals(approvalsRes.data.data || []);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'agent',
          content: 'Approval accepted. The operation has been executed.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await api.approvals.reject(approvalId, 'user@example.com', 'Rejected from playground');
      const approvalsRes = await api.approvals.list(projectId, 'pending');
      setApprovals(approvalsRes.data.data || []);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'agent',
          content: 'Request rejected. The operation was not executed.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="site-shell py-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-[72vh] rounded-[28px] border border-white/10 bg-white/[0.04]" />
            <div className="space-y-4">
              <div className="h-40 rounded-[28px] border border-white/10 bg-white/[0.04]" />
              <div className="h-40 rounded-[28px] border border-white/10 bg-white/[0.04]" />
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
          <EmptyState title="Project not found" description="The playground could not load the requested project." action={<ActionLink href="/" accent>Go home</ActionLink>} />
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
              <Link href={`/projects/${projectId}/export`} className="btn btn-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                Back
              </Link>
              <div>
                <p className="section-kicker">Playground</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[color:var(--text)]">{project.name}</h1>
                <p className="mt-2 text-sm text-white/55">Agent chat and approval workflow</p>
              </div>
            </div>
            {approvals.length > 0 ? <Pill tone="accent">{approvals.length} pending approvals</Pill> : <Pill tone="success">No pending approvals</Pill>}
          </div>
        </div>
      </header>

      <main className="site-shell py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Panel className="flex min-h-[72vh] flex-col overflow-hidden p-0">
            <div className="border-b border-white/10 px-6 py-4">
              <SectionHeader
                kicker="Chat"
                title="Ask the agent anything."
                description="Use natural language to exercise the generated MCP tools and watch approval gates appear when needed."
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[82%] rounded-[24px] border px-4 py-4 ${
                        message.type === 'user'
                          ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-soft)]'
                          : 'border-white/10 bg-white/[0.05]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--text)]">{message.content}</p>
                      {message.response ? (
                        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-white/55">
                          {message.response.toolUsed ? (
                            <div>
                              <span className="text-white/35">Tool:</span> <code className="font-mono text-white/75">{message.response.toolUsed}</code>
                            </div>
                          ) : null}
                          {message.response.riskLevel ? (
                            <div>
                              <span className="text-white/35">Risk:</span> <span className="text-white/75">{message.response.riskLevel}</span>
                            </div>
                          ) : null}
                          {message.response.result ? (
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                              <pre className="overflow-x-auto font-mono text-[11px] leading-5 text-white/72">
                                {JSON.stringify(message.response.result, null, 2)}
                              </pre>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/30">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {sending ? (
                  <div className="flex justify-start">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm text-white/55">Thinking...</div>
                  </div>
                ) : null}
              </div>
            </div>

            {error ? <div className="border-t border-red-400/20 bg-red-400/10 px-6 py-3 text-sm text-red-200">{error}</div> : null}

            <div className="border-t border-white/10 px-6 py-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about the API..."
                  className="input flex-1"
                  disabled={sending}
                />
                <button onClick={handleSend} disabled={sending || !input.trim()} className="btn btn-primary">
                  Send
                </button>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/30">
                Try: “How many leaves does E102 have?” or “Get payroll for E101”
              </p>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel className="p-6">
              <p className="section-kicker">Approvals</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text)]">Pending approvals</h2>

              {approvals.length === 0 ? (
                <div className="mt-5">
                  <EmptyState title="No pending approvals" description="High-risk operations will appear here when the agent requests them." />
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {approvals.map((approval) => (
                    <div key={approval.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[color:var(--text)]">{approval.toolName}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/30">
                            {new Date(approval.requestedAt).toLocaleString()}
                          </p>
                        </div>
                        <Pill tone="accent">Review</Pill>
                      </div>

                      {approval.parameters ? (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-3">
                          <pre className="overflow-x-auto font-mono text-[11px] leading-5 text-white/72">
                            {JSON.stringify(approval.parameters, null, 2)}
                          </pre>
                        </div>
                      ) : null}

                      <div className="mt-4 flex gap-3">
                        <button onClick={() => handleApprove(approval.id)} className="btn btn-primary flex-1 text-xs uppercase tracking-[0.18em]">
                          Approve
                        </button>
                        <button onClick={() => handleReject(approval.id)} className="btn btn-secondary flex-1 text-xs uppercase tracking-[0.18em]">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="p-6">
              <p className="section-kicker">Sample queries</p>
              <div className="mt-4 space-y-2">
                {[
                  'How many leaves does employee E102 have?',
                  'Get payroll information for E101',
                  'Check leave balance for E103',
                  'Create an HR ticket for E102',
                ].map((query) => (
                  <button
                    key={query}
                    onClick={() => setInput(query)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/68 transition hover:bg-white/[0.06]"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <p className="section-kicker">How it works</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/58">
                <p>Ask questions in natural language.</p>
                <p>The agent selects the correct tool.</p>
                <p>High-risk operations require approval.</p>
                <p>Results appear in the chat immediately.</p>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}

// Made with Bob
