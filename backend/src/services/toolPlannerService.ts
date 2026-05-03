import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import {
  Endpoint,
  MCPTool,
  ToolsStorage,
  Parameter,
  ValidationError,
} from '../types';
import { readData, writeData } from '../utils/fileUtils';

const TOOLS_FILE = 'tools.json';

/**
 * Tool Planner Service
 * Converts API endpoints to MCP tools
 */
class ToolPlannerService {
  /**
   * Generate MCP tools from endpoints
   */
  async generateTools(projectId: string, endpoints: Endpoint[]): Promise<MCPTool[]> {
    console.log(`[ToolPlannerService] Generating tools for ${endpoints.length} endpoints`);

    const tools: MCPTool[] = [];

    for (const endpoint of endpoints) {
      try {
        const tool = this.createToolFromEndpoint(projectId, endpoint);
        tools.push(tool);
      } catch (error) {
        console.error(`[ToolPlannerService] Error creating tool for endpoint ${endpoint.id}:`, error);
        // Continue with other endpoints
      }
    }

    // Save tools to storage
    await this.saveTools(tools);

    console.log(`[ToolPlannerService] Generated ${tools.length} tools`);
    return tools;
  }

  /**
   * Create an MCP tool from an endpoint
   */
  private createToolFromEndpoint(projectId: string, endpoint: Endpoint): MCPTool {
    // Generate tool name from endpoint path
    const toolName = this.generateToolName(endpoint);

    // Generate description
    const description = this.generateDescription(endpoint);

    // Generate input schema
    const inputSchema = this.generateInputSchema(endpoint);

    // Create tool (risk assessment will be done by RiskEngineService)
    const tool: MCPTool = {
      id: uuidv4(),
      projectId,
      endpointId: endpoint.id,
      name: toolName,
      description,
      inputSchema,
      riskLevel: 'LOW', // Default, will be updated by risk engine
      approvalRequired: false, // Default, will be updated by risk engine
      riskReason: 'Not yet assessed',
    };

    return tool;
  }

  /**
   * Generate tool name from endpoint
   * Example: GET /employees/{id}/leave-balance -> check_leave_balance
   */
  private generateToolName(endpoint: Endpoint): string {
    // Remove path parameters
    let path = endpoint.path.replace(/\{[^}]+\}/g, '');

    // Remove leading/trailing slashes
    path = path.replace(/^\/|\/$/g, '');

    // Split by slashes and filter empty parts
    const parts = path.split('/').filter((p) => p.length > 0);

    // Add verb based on HTTP method
    const verb = this.getVerbForMethod(endpoint.method);

    // Combine parts with underscores
    const name = [verb, ...parts].join('_').toLowerCase();

    // Replace hyphens with underscores (hyphens are invalid in JS identifiers)
    const sanitized = name.replace(/-/g, '_');

    // Clean up multiple underscores
    return sanitized.replace(/_+/g, '_');
  }

  /**
   * Get appropriate verb for HTTP method
   */
  private getVerbForMethod(method: string): string {
    switch (method) {
      case 'GET':
        return 'get';
      case 'POST':
        return 'create';
      case 'PUT':
        return 'update';
      case 'PATCH':
        return 'modify';
      case 'DELETE':
        return 'delete';
      default:
        return 'execute';
    }
  }

  /**
   * Generate description for tool
   */
  private generateDescription(endpoint: Endpoint): string {
    if (endpoint.description && endpoint.description.trim().length > 0) {
      return endpoint.description;
    }

    // Generate default description
    const verb = this.getVerbForMethod(endpoint.method);
    const resource = endpoint.path.split('/').filter((p) => p && !p.startsWith('{')).pop() || 'resource';

    return `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${resource}`;
  }

  /**
   * Generate Zod input schema from endpoint parameters
   */
  private generateInputSchema(endpoint: Endpoint): any {
    const schemaFields: Record<string, any> = {};

    if (endpoint.parameters) {
      for (const param of endpoint.parameters) {
        schemaFields[param.name] = this.parameterToZodSchema(param);
      }
    }

    // Return schema definition as object (will be converted to Zod in generated code)
    return {
      type: 'object',
      properties: schemaFields,
      required: endpoint.parameters?.filter((p) => p.required).map((p) => p.name) || [],
    };
  }

  /**
   * Convert parameter to Zod schema definition
   */
  private parameterToZodSchema(param: Parameter): any {
    let schema: any = {
      type: this.mapTypeToZod(param.type),
    };

    if (param.description) {
      schema.description = param.description;
    }

    if (!param.required) {
      schema.optional = true;
    }

    return schema;
  }

  /**
   * Map TypeScript type to Zod type
   */
  private mapTypeToZod(type: string): string {
    switch (type.toLowerCase()) {
      case 'string':
        return 'string';
      case 'number':
      case 'integer':
      case 'int':
        return 'number';
      case 'boolean':
      case 'bool':
        return 'boolean';
      case 'array':
        return 'array';
      case 'object':
        return 'object';
      default:
        return 'string';
    }
  }

  /**
   * Save tools to storage
   */
  private async saveTools(tools: MCPTool[]): Promise<void> {
    const storage = await readData<ToolsStorage>(TOOLS_FILE);
    storage.tools.push(...tools);
    await writeData(TOOLS_FILE, storage);
  }

  /**
   * Get tools for a project
   */
  async getTools(projectId: string): Promise<MCPTool[]> {
    const storage = await readData<ToolsStorage>(TOOLS_FILE);
    return storage.tools.filter((t) => t.projectId === projectId);
  }

  /**
   * Get a single tool by ID
   */
  async getTool(id: string): Promise<MCPTool | null> {
    const storage = await readData<ToolsStorage>(TOOLS_FILE);
    return storage.tools.find((t) => t.id === id) || null;
  }

  /**
   * Update a tool
   */
  async updateTool(id: string, updates: Partial<MCPTool>): Promise<MCPTool> {
    const storage = await readData<ToolsStorage>(TOOLS_FILE);
    const toolIndex = storage.tools.findIndex((t) => t.id === id);

    if (toolIndex === -1) {
      throw new ValidationError(`Tool with id ${id} not found`);
    }

    storage.tools[toolIndex] = {
      ...storage.tools[toolIndex],
      ...updates,
    };

    await writeData(TOOLS_FILE, storage);
    return storage.tools[toolIndex];
  }

  /**
   * Delete tools for a project
   */
  async deleteTools(projectId: string): Promise<void> {
    const storage = await readData<ToolsStorage>(TOOLS_FILE);
    storage.tools = storage.tools.filter((t) => t.projectId !== projectId);
    await writeData(TOOLS_FILE, storage);
  }

  /**
   * Get tool by name
   */
  async getToolByName(projectId: string, name: string): Promise<MCPTool | null> {
    const storage = await readData<ToolsStorage>(TOOLS_FILE);
    return (
      storage.tools.find((t) => t.projectId === projectId && t.name === name) || null
    );
  }
}

// Export singleton instance
export const toolPlannerService = new ToolPlannerService();

// Made with Bob
