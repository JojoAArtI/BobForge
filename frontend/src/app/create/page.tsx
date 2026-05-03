'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function CreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create project with documentation
      const projectResponse = await api.projects.create({
        name: formData.name,
        description: formData.description,
        apiDocumentation: formData.documentation,
      });

      const projectId = projectResponse.data.data.id;

      // Parse documentation
      await api.endpoints.parse(projectId, {
        documentation: formData.documentation,
      });

      // Redirect to analysis page
      router.push(`/projects/${projectId}/analysis`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const loadSample = () => {
    setFormData({
      name: 'HR System API',
      description: 'Employee leave management and payroll system',
      documentation: sampleDocs,
    });
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Convert your API documentation into MCP tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Details</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., HR System API"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  placeholder="Brief description of your API"
                />
              </div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">API Documentation</h2>
              <button
                type="button"
                onClick={loadSample}
                className="btn btn-secondary text-sm"
              >
                Load Sample
              </button>
            </div>

            <div>
              <label htmlFor="documentation" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your API documentation here *
              </label>
              <textarea
                id="documentation"
                name="documentation"
                required
                value={formData.documentation}
                onChange={handleChange}
                rows={20}
                className="textarea font-mono text-sm"
                placeholder="Paste your API documentation here...

Example:
GET /api/users/{id}
Returns user information
Parameters:
  - id (path, required): User ID

POST /api/users
Create a new user
Parameters:
  - name (body, required): User name
  - email (body, required): User email"
              />
              <p className="mt-2 text-sm text-gray-600">
                Paste raw API documentation. BobForge will automatically extract endpoints, parameters, and generate MCP tools.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-red-600 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link href="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Documentation →
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 What happens next?</h3>
          <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
            <li>BobForge will parse your API documentation using watsonx.ai Granite</li>
            <li>Endpoints will be extracted and converted into MCP tool definitions</li>
            <li>Risk assessment will be performed on each tool</li>
            <li>You'll review the generated tools and approve the plan</li>
            <li>Complete MCP server code will be generated with tests</li>
            <li>Download and deploy your agent-ready MCP server!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Made with Bob