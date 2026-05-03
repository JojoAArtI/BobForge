'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project } from '@/types';

export default function ExportPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

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

  const handleDownload = () => {
    setDownloading(true);
    const downloadUrl = api.export.download(projectId);
    
    // Create a temporary link and trigger download
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <Link href={`/projects/${projectId}/preview`} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-600">Export & Deploy</p>
              </div>
            </div>
            <span className="badge bg-green-100 text-green-800">
              Ready to Export
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your MCP Server is Ready!
          </h2>
          <p className="text-lg text-gray-700">
            Download the complete package and deploy to production
          </p>
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

        {/* Download Section */}
        <div className="card mb-8">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Download MCP Server</h3>
            <p className="text-gray-600 mb-6">
              Complete TypeScript MCP server with tools, tests, and documentation
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary text-lg px-8 py-3"
            >
              {downloading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Preparing Download...
                </>
              ) : (
                <>
                  📥 Download ZIP
                </>
              )}
            </button>
          </div>
        </div>

        {/* What's Included */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 What's Included</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Complete MCP Server</p>
                <p className="text-sm text-gray-600">TypeScript server with all tools implemented</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Zod Schemas</p>
                <p className="text-sm text-gray-600">Input validation for all parameters</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Risk Policy</p>
                <p className="text-sm text-gray-600">JSON policy with approval requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Test Suite</p>
                <p className="text-sm text-gray-600">Comprehensive tests for all tools</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Documentation</p>
                <p className="text-sm text-gray-600">README with setup and usage instructions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Package Configuration</p>
                <p className="text-sm text-gray-600">package.json with all dependencies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Start</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">1. Extract the ZIP file</p>
              <div className="bg-gray-900 rounded-lg p-3">
                <code className="text-sm text-gray-100">unzip {project.name.replace(/\s+/g, '-').toLowerCase()}-mcp-server.zip</code>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">2. Install dependencies</p>
              <div className="bg-gray-900 rounded-lg p-3">
                <code className="text-sm text-gray-100">cd mcp-server && npm install</code>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">3. Configure environment</p>
              <div className="bg-gray-900 rounded-lg p-3">
                <code className="text-sm text-gray-100">cp .env.example .env</code>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">4. Start the server</p>
              <div className="bg-gray-900 rounded-lg p-3">
                <code className="text-sm text-gray-100">npm run dev</code>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Next Steps</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>Configure your API endpoints in the .env file</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>Test the MCP server with the included test suite</span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>Connect your AI agent (Claude, GPT, etc.) to the MCP server</span>
            </li>
            <li className="flex items-start gap-2">
              <span>4.</span>
              <span>Review and approve high-risk operations as needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span>5.</span>
              <span>Deploy to production when ready</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Link href="/" className="btn btn-secondary">
            ← Back to Projects
          </Link>
          <Link href={`/projects/${projectId}/playground`} className="btn btn-primary">
            Test in Playground →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Made with Bob