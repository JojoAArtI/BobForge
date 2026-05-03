'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, RiskPolicy } from '@/types';

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
    loadData();
  }, [projectId]);

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

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return '✅';
      case 'MEDIUM':
        return '⚠️';
      case 'HIGH':
        return '🔶';
      case 'CRITICAL':
        return '🚨';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading risk assessment...</p>
        </div>
      </div>
    );
  }

  if (!project || !policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Not Found</h2>
          <Link href="/" className="btn btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const riskCounts = {
    LOW: policy.tools?.filter(t => t.riskLevel === 'LOW').length || 0,
    MEDIUM: policy.tools?.filter(t => t.riskLevel === 'MEDIUM').length || 0,
    HIGH: policy.tools?.filter(t => t.riskLevel === 'HIGH').length || 0,
    CRITICAL: policy.tools?.filter(t => t.riskLevel === 'CRITICAL').length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/plan`} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-600">Risk Assessment & Policy</p>
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
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🛡️ Risk Assessment Complete
              </h2>
              <p className="text-gray-700">
                {policy.tools?.length || 0} tool{(policy.tools?.length || 0) !== 1 ? 's' : ''} assessed with safety policies
              </p>
            </div>
            <div className="text-6xl">🔒</div>
          </div>
        </div>

        {/* Risk Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-green-50 border-green-200">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-800">{riskCounts.LOW}</div>
              <div className="text-sm text-green-700 mt-1">Low Risk</div>
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold text-yellow-800">{riskCounts.MEDIUM}</div>
              <div className="text-sm text-yellow-700 mt-1">Medium Risk</div>
            </div>
          </div>
          <div className="card bg-orange-50 border-orange-200">
            <div className="text-center">
              <div className="text-3xl mb-2">🔶</div>
              <div className="text-2xl font-bold text-orange-800">{riskCounts.HIGH}</div>
              <div className="text-sm text-orange-700 mt-1">High Risk</div>
            </div>
          </div>
          <div className="card bg-red-50 border-red-200">
            <div className="text-center">
              <div className="text-3xl mb-2">🚨</div>
              <div className="text-2xl font-bold text-red-800">{riskCounts.CRITICAL}</div>
              <div className="text-sm text-red-700 mt-1">Critical Risk</div>
            </div>
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

        {/* Tools with Risk Assessment */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Tool Risk Assessment</h3>
          
          <div className="space-y-4">
            {policy.tools?.map((tool, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-6 ${getRiskColor(tool.riskLevel)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getRiskIcon(tool.riskLevel)}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{tool.toolName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tool.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${getRiskColor(tool.riskLevel)}`}>
                      {tool.riskLevel}
                    </span>
                    {tool.approvalRequired && (
                      <span className="badge bg-purple-100 text-purple-800">
                        🔐 Approval Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Risk Details */}
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Approval Required:</span>{' '}
                      <span className={tool.approvalRequired ? 'text-red-700' : 'text-green-700'}>
                        {tool.approvalRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Risk Level:</span>{' '}
                      <span className="font-semibold">{tool.riskLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Summary */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Project ID:</dt>
                <dd className="text-gray-900 font-mono mt-1">{policy.projectId}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Total Tools:</dt>
                <dd className="text-gray-900 mt-1">{policy.tools?.length || 0}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Requires Approval:</dt>
                <dd className="text-gray-900 mt-1">
                  {policy.tools?.filter(t => t.approvalRequired).length || 0} tools
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Created:</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(policy.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">🛡️ Enterprise Safety</h3>
          <p className="text-sm text-purple-800 mb-3">
            BobForge automatically assesses risk for each tool to ensure safe AI agent execution:
          </p>
          <ul className="text-sm text-purple-800 space-y-1 ml-4 list-disc">
            <li><strong>LOW:</strong> Safe read operations (GET requests, non-sensitive data)</li>
            <li><strong>MEDIUM:</strong> Read operations with sensitive data (employee info, payroll)</li>
            <li><strong>HIGH:</strong> Write operations (POST, PUT, PATCH)</li>
            <li><strong>CRITICAL:</strong> Destructive operations (DELETE, financial transactions)</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Next Step</h4>
            <p className="text-sm text-gray-600">
              Generate complete MCP server code with tests
            </p>
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={generating}
            className="btn btn-primary"
          >
            {generating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Generating Code...
              </>
            ) : (
              <>
                Generate Code →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob