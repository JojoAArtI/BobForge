import express, { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { parserService } from '../services/parserService';
import { toolPlannerService } from '../services/toolPlannerService';
import { riskEngineService } from '../services/riskEngineService';
import { mcpGeneratorService } from '../services/mcpGeneratorService';
import { agentService } from '../services/agentService';
import { createZipStream } from '../utils/zipUtils';
import path from 'path';

const router = express.Router();

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, apiDocumentation } = req.body;

    const project = await projectService.createProject({
      name,
      description,
      apiDocumentation,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects
 * List all projects
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await projectService.listProjects();

    res.json({
      success: true,
      data: projects,
      total: projects.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id
 * Get a project by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProject(id);

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await projectService.updateProject(id, updates);

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/projects/:id/parse
 * Parse API documentation
 */
router.post('/:id/parse', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProject(id);

    // Parse documentation
    const endpoints = await parserService.parseDocumentation(
      id,
      project.apiDocumentation
    );

    // Update project status
    await projectService.updateProject(id, { status: 'analyzing' });

    res.json({
      success: true,
      data: endpoints,
      total: endpoints.length,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/endpoints
 * Get endpoints for a project
 */
router.get('/:id/endpoints', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const endpoints = await parserService.getEndpoints(id);

    res.json({
      success: true,
      data: endpoints,
      total: endpoints.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/projects/:id/generate-tools
 * Generate MCP tools from endpoints
 */
router.post('/:id/generate-tools', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const endpoints = await parserService.getEndpoints(id);

    if (endpoints.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No endpoints found. Please parse API documentation first.',
      });
    }

    const tools = await toolPlannerService.generateTools(id, endpoints);

    res.json({
      success: true,
      data: tools,
      total: tools.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/tools
 * Get tools for a project
 */
router.get('/:id/tools', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tools = await toolPlannerService.getTools(id);

    res.json({
      success: true,
      data: tools,
      total: tools.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/projects/:id/assess-risk
 * Assess risk for all tools
 */
router.post('/:id/assess-risk', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tools = await toolPlannerService.getTools(id);
    const endpoints = await parserService.getEndpoints(id);

    if (tools.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No tools found. Please generate tools first.',
      });
    }

    const policy = await riskEngineService.assessRisk(id, tools, endpoints);

    // Update project status
    await projectService.updateProject(id, { status: 'ready' });

    res.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/policy
 * Get risk policy for a project
 */
router.get('/:id/policy', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policy = await riskEngineService.getPolicy(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found. Please assess risk first.',
      });
    }

    res.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/projects/:id/generate
 * Generate MCP server code
 */
router.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProject(id);
    const tools = await toolPlannerService.getTools(id);
    const policy = await riskEngineService.getPolicy(id);

    if (tools.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No tools found. Please generate tools first.',
      });
    }

    if (!policy) {
      return res.status(400).json({
        success: false,
        error: 'No policy found. Please assess risk first.',
      });
    }

    const generated = await mcpGeneratorService.generateServer(project, tools, policy);

    // Update project status
    await projectService.updateProject(id, { status: 'generated' });

    res.json({
      success: true,
      data: generated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/preview
 * Preview generated code
 */
router.get('/:id/preview', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const generated = await mcpGeneratorService.getGeneratedFiles(id);

    if (!generated) {
      return res.status(404).json({
        success: false,
        error: 'No generated files found. Please generate code first.',
      });
    }

    res.json({
      success: true,
      data: generated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/export
 * Download generated MCP server as ZIP
 */
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProject(id);

    const generatedDir = path.join(__dirname, '../../../generated', `mcp-server-${id}`);

    // Create ZIP stream
    const archive = createZipStream(generatedDir);

    // Set headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=mcp-server-${project.name.toLowerCase().replace(/\s+/g, '-')}.zip`
    );

    // Pipe archive to response
    archive.pipe(res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/projects/:id/agent/query
 * Process agent query
 */
router.post('/:id/agent/query', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { query, userId } = req.body;

    const response = await agentService.processQuery({
      query,
      projectId: id,
      userId,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/approvals
 * List approvals for a project
 */
router.get('/:id/approvals', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const approvals = await agentService.listApprovals(id, status as string);

    res.json({
      success: true,
      data: approvals,
      total: approvals.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/approvals/:id/approve
 * Approve a request
 */
router.post('/approvals/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy, reason } = req.body;

    const response = await agentService.approveRequest(id, approvedBy, reason);

    res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/approvals/:id/reject
 * Reject a request
 */
router.post('/approvals/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectedBy, reason } = req.body;

    await agentService.rejectRequest(id, rejectedBy, reason);

    res.json({
      success: true,
      message: 'Request rejected successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/projects/:id/statistics
 * Get project statistics
 */
router.get('/:id/statistics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const endpoints = await parserService.getEndpoints(id);
    const tools = await toolPlannerService.getTools(id);
    const riskStats = await riskEngineService.getRiskStatistics(id);
    const pendingApprovals = await agentService.getPendingApprovalsCount(id);

    res.json({
      success: true,
      data: {
        endpoints: endpoints.length,
        tools: tools.length,
        riskDistribution: riskStats,
        pendingApprovals,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

// Made with Bob
