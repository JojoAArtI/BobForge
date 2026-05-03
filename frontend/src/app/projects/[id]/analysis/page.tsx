'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, Endpoint } from '@/types';

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
    loadData();
  }, [projectId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading analysis...</p>
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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-600">{project.description}</p>
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
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✅ API Documentation Parsed Successfully
              </h2>
              <p className="text-gray-700">
                Found {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} ready to be converted into MCP tools
              </p>
            </div>
            <div className="text-6xl">🎉</div>
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

        {/* Endpoints List */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Extracted Endpoints</h3>
          
          {endpoints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No endpoints found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div
                  key={endpoint.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                      <span
                        className={`badge ${
                          endpoint.method === 'GET'
                            ? 'bg-green-100 text-green-800'
                            : endpoint.method === 'POST'
                            ? 'bg-blue-100 text-blue-800'
                            : endpoint.method === 'PUT' || endpoint.method === 'PATCH'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-gray-100 text-gray-800">
                        {endpoint.operationType}
                      </span>
                      {endpoint.sensitive && (
                        <span className="badge bg-orange-100 text-orange-800">
                          🔒 Sensitive
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {endpoint.description && (
                    <p className="text-sm text-gray-600 mb-3 ml-16">{endpoint.description}</p>
                  )}
                  
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div className="ml-16 mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-2">Parameters:</p>
                      <div className="flex flex-wrap gap-2">
                        {endpoint.parameters.map((param, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            <code className="font-mono">{param.name}</code>
                            <span className="mx-1">:</span>
                            <span className="text-gray-500">{param.type}</span>
                            {param.required && (
                              <span className="ml-1 text-red-600">*</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Next Step</h4>
            <p className="text-sm text-gray-600">
              Generate MCP tools from these endpoints
            </p>
          </div>
          <button
            onClick={handleGenerateTools}
            disabled={generating || endpoints.length === 0}
            className="btn btn-primary"
          >
            {generating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Generating Tools...
              </>
            ) : (
              <>
                Generate MCP Tools →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob