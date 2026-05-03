'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, MCPTool } from '@/types';

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
    loadData();
  }, [projectId]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading tools...</p>
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
              <Link href={`/projects/${projectId}/analysis`} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-600">MCP Tool Plan</p>
              </div>
            </div>
            <span className="badge bg-blue-100 text-blue-800">
              {project.status}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🛠️ MCP Tools Generated Successfully
              </h2>
              <p className="text-gray-700">
                {tools.length} tool{tools.length !== 1 ? 's' : ''} ready for risk assessment
              </p>
            </div>
            <div className="text-6xl">✨</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <div className="text-red-600 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tools List */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Generated MCP Tools</h3>
          
          {tools.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No tools generated</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                      </div>
                    </div>
                    <span className="badge bg-blue-100 text-blue-800">
                      MCP Tool
                    </span>
                  </div>

                  {/* Input Schema */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-3">Input Parameters:</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-xs font-mono text-gray-800 overflow-x-auto">
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Endpoint Reference */}
                  {tool.endpointId && (
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="font-medium">Source Endpoint:</span> {tool.endpointId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 What are MCP Tools?</h3>
          <p className="text-sm text-blue-800 mb-3">
            Model Context Protocol (MCP) tools are standardized interfaces that allow AI agents to interact with your APIs safely and reliably.
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li>Each tool has a clear name and description</li>
            <li>Input parameters are validated using Zod schemas</li>
            <li>Tools can be called by AI agents like Claude or GPT</li>
            <li>Risk assessment ensures safe execution</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Next Step</h4>
            <p className="text-sm text-gray-600">
              Assess risk levels for each tool
            </p>
          </div>
          <button
            onClick={handleAssessRisk}
            disabled={assessing || tools.length === 0}
            className="btn btn-primary"
          >
            {assessing ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Assessing Risk...
              </>
            ) : (
              <>
                Assess Risk →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob