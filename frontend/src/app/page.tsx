'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/types';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.projects.list();
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔨 BobForge</h1>
              <p className="mt-1 text-sm text-gray-600">
                Convert API docs into secure, tested, and agent-ready MCP tools
              </p>
            </div>
            <Link
              href="/create"
              className="btn btn-primary"
            >
              + Create New Project
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise APIs → Agent-Ready MCP Tools
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Automate the entire pipeline: Parse documentation, generate tools, assess risk, 
              create tests, and export production-ready MCP servers.
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-primary">🤖</div>
                <div className="text-sm text-gray-600 mt-1">AI-Powered</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-success">🛡️</div>
                <div className="text-sm text-gray-600 mt-1">Enterprise Safe</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-warning">⚡</div>
                <div className="text-sm text-gray-600 mt-1">Fast Setup</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-info">📦</div>
                <div className="text-sm text-gray-600 mt-1">Ready to Deploy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Projects</h3>
          <p className="text-gray-600">
            {projects.length === 0
              ? 'No projects yet. Create your first project to get started.'
              : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h4>
            <p className="text-gray-600 mb-6">
              Create your first project to start converting API documentation into MCP tools
            </p>
            <Link href="/create" className="btn btn-primary">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/analysis`}
                className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                  <span
                    className={`badge ${
                      project.status === 'draft'
                        ? 'bg-gray-100 text-gray-800'
                        : project.status === 'analyzing'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'ready'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span className="text-primary font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📄</div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Paste API Docs</h4>
              <p className="text-sm text-gray-600">
                Simply paste your raw API documentation
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Auto-Parse</h4>
              <p className="text-sm text-gray-600">
                AI extracts endpoints and parameters
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Risk Assessment</h4>
              <p className="text-sm text-gray-600">
                Automatic risk scoring and policies
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📦</div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Export & Deploy</h4>
              <p className="text-sm text-gray-600">
                Download complete MCP server code
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Built for IBM Bob Dev Day Hackathon | Powered by watsonx.ai Granite
          </p>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
