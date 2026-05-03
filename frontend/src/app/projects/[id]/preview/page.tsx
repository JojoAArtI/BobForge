'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, GeneratedFiles } from '@/types';

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
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectRes, filesRes] = await Promise.all([
        api.projects.get(projectId),
        api.generate.preview(projectId),
      ]);

      setProject(projectRes.data.data);
      setFiles(filesRes.data.data);
      
      // Select first file by default
      if (filesRes.data.data?.files?.length > 0) {
        setSelectedFile(filesRes.data.data.files[0].path);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    router.push(`/projects/${projectId}/export`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'typescript':
        return '📘';
      case 'json':
        return '📋';
      case 'markdown':
        return '📝';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!project || !files) {
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

  const currentFile = files.files.find(f => f.path === selectedFile);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/risk`} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="mt-1 text-sm text-gray-600">Code Preview</p>
              </div>
            </div>
            <span className="badge bg-green-100 text-green-800">
              Generated
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✅ MCP Server Generated Successfully
              </h2>
              <p className="text-gray-700">
                {files.files.length} files ready to download and deploy
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

        {/* File Browser */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* File List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Files</h3>
              <div className="space-y-1">
                {files.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFile === file.path
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getFileIcon(file.type)}</span>
                      <span className="truncate font-mono text-xs">{file.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-mono">
                  {currentFile?.path || 'Select a file'}
                </h3>
                <span className="badge bg-gray-100 text-gray-800">
                  {currentFile?.type || 'unknown'}
                </span>
              </div>
              
              {currentFile ? (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100 font-mono">
                    <code>{currentFile.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <p>Select a file to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Structure */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Structure</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm font-mono text-gray-800">
              {files.structure.join('\n')}
            </pre>
          </div>
        </div>

        {/* Next Steps */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Next Steps</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎮</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">Test with AI Agent</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Try your MCP tools in the interactive playground
                  </p>
                  <Link
                    href={`/projects/${projectId}/playground`}
                    className="btn btn-secondary text-sm"
                  >
                    Open Playground →
                  </Link>
                </div>
              </div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">Download & Deploy</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Export your MCP server as a ZIP file
                  </p>
                  <button
                    onClick={handleExport}
                    className="btn btn-primary text-sm"
                  >
                    Download ZIP →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob