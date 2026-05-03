'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, AgentResponse, Approval } from '@/types';

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
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectRes, approvalsRes] = await Promise.all([
        api.projects.get(projectId),
        api.approvals.list(projectId, 'pending'),
      ]);

      setProject(projectRes.data.data);
      setApprovals(approvalsRes.data.data || []);
      
      // Add welcome message
      setMessages([{
        id: '1',
        type: 'agent',
        content: 'Hello! I\'m your AI assistant. I can help you interact with the HR API. Try asking me something like "How many leaves does employee E102 have?" or "Get payroll for E101".',
        timestamp: new Date().toISOString(),
      }]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, agentMessage]);

      // Reload approvals if one was created
      if (agentResponse.approvalRequired) {
        const approvalsRes = await api.approvals.list(projectId, 'pending');
        setApprovals(approvalsRes.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await api.approvals.approve(approvalId, 'user@example.com', 'Approved from playground');
      
      // Reload approvals
      const approvalsRes = await api.approvals.list(projectId, 'pending');
      setApprovals(approvalsRes.data.data || []);

      // Add success message
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: '✅ Request approved! The operation has been executed.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await api.approvals.reject(approvalId, 'user@example.com', 'Rejected from playground');
      
      // Reload approvals
      const approvalsRes = await api.approvals.list(projectId, 'pending');
      setApprovals(approvalsRes.data.data || []);

      // Add rejection message
      const rejectMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: '❌ Request rejected. The operation was not executed.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, rejectMessage]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return 'text-green-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'CRITICAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading playground...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <Link href="/" className="btn btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/export`} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-600">Agent Playground</p>
              </div>
            </div>
            {approvals.length > 0 && (
              <span className="badge bg-orange-100 text-orange-800">
                {approvals.length} Pending Approval{approvals.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="card h-[calc(100vh-250px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Agent Response Details */}
                      {message.response && message.type === 'agent' && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                          {message.response.toolUsed && (
                            <div className="text-xs">
                              <span className="font-medium">Tool:</span>{' '}
                              <code className="bg-gray-200 px-1 rounded">{message.response.toolUsed}</code>
                            </div>
                          )}
                          {message.response.riskLevel && (
                            <div className="text-xs">
                              <span className="font-medium">Risk:</span>{' '}
                              <span className={getRiskColor(message.response.riskLevel)}>
                                {message.response.riskLevel}
                              </span>
                            </div>
                          )}
                          {message.response.result && (
                            <div className="text-xs">
                              <span className="font-medium">Result:</span>
                              <pre className="mt-1 bg-gray-200 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(message.response.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about the HR API..."
                    className="input flex-1"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="btn btn-primary"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Try: "How many leaves does E102 have?" or "Get payroll for E101"
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pending Approvals */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔐 Pending Approvals
              </h3>
              
              {approvals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-sm">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className="border border-orange-200 rounded-lg p-3 bg-orange-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{approval.toolName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(approval.requestedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {approval.parameters && (
                        <div className="mt-2 text-xs">
                          <p className="font-medium text-gray-700">Parameters:</p>
                          <pre className="mt-1 bg-white p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(approval.parameters, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sample Queries */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Sample Queries
              </h3>
              <div className="space-y-2">
                {[
                  'How many leaves does employee E102 have?',
                  'Get payroll information for E101',
                  'Check leave balance for E103',
                  'Create an HR ticket for E102',
                ].map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(query)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How it works</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Ask questions in natural language</li>
                <li>• AI selects the right tool</li>
                <li>• High-risk operations require approval</li>
                <li>• Results are shown in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob