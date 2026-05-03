import { v4 as uuidv4 } from 'uuid';
import {
  AgentQuery,
  AgentResponse,
  MCPTool,
  Approval,
  ApprovalsStorage,
  ToolExecutionResult,
} from '../types';
import { readData, writeData } from '../utils/fileUtils';
import { toolPlannerService } from './toolPlannerService';
import { riskEngineService } from './riskEngineService';
import { mockApiService } from './mockApiService';
import { watsonxService } from './watsonxService';

const APPROVALS_FILE = 'approvals.json';

/**
 * Agent Service
 * Handles agent playground interactions
 */
class AgentService {
  /**
   * Process agent query
   */
  async processQuery(query: AgentQuery): Promise<AgentResponse> {
    console.log(`[AgentService] Processing query: "${query.query}"`);

    try {
      // Get tools for the project
      const tools = await toolPlannerService.getTools(query.projectId);

      if (tools.length === 0) {
        return {
          message: 'No tools available for this project. Please generate tools first.',
          error: 'No tools found',
          timestamp: new Date().toISOString(),
        };
      }

      // Select appropriate tool based on query (with AI if available)
      const selectedTool = await this.selectTool(query.query, tools);

      if (!selectedTool) {
        return {
          message: 'I could not find an appropriate tool for your request. Please try rephrasing.',
          error: 'No matching tool found',
          timestamp: new Date().toISOString(),
        };
      }

      // Extract parameters from query (with AI if available)
      const parameters = await this.extractParameters(query.query, selectedTool);

      // Check if approval is required
      const approvalRequired = await riskEngineService.checkApprovalRequired(
        query.projectId,
        selectedTool.name
      );

      if (approvalRequired) {
        // Create approval request
        const approval = await this.createApprovalRequest(
          query.projectId,
          selectedTool.name,
          parameters,
          query.userId || 'agent'
        );

        return {
          message: `This operation requires approval due to ${selectedTool.riskLevel} risk level. An approval request has been created.`,
          toolUsed: selectedTool.name,
          toolDescription: selectedTool.description,
          parameters,
          approvalRequired: true,
          approvalId: approval.id,
          riskLevel: selectedTool.riskLevel,
          timestamp: new Date().toISOString(),
        };
      }

      // Execute tool immediately
      const result = await this.executeTool(selectedTool, parameters);

      if (!result.success) {
        return {
          message: `Failed to execute tool: ${result.error}`,
          toolUsed: selectedTool.name,
          error: result.error,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        message: `Successfully executed ${selectedTool.name}`,
        toolUsed: selectedTool.name,
        toolDescription: selectedTool.description,
        parameters,
        result: result.data,
        riskLevel: selectedTool.riskLevel,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[AgentService] Error processing query:', error);
      return {
        message: 'An error occurred while processing your request.',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Select appropriate tool based on query
   * Uses watsonx.ai Granite for intelligent tool selection with fallback
   */
  private async selectTool(query: string, tools: MCPTool[]): Promise<MCPTool | null> {
    const useMockMode = process.env.WATSONX_MOCK_MODE === 'true';

    if (!useMockMode && watsonxService.isConfigured()) {
      try {
        console.log('[AgentService] Using watsonx.ai Granite for tool selection');
        const result = await watsonxService.processQuery(query, tools);
        
        if (result.tool) {
          const selectedTool = tools.find(t => t.name === result.tool);
          if (selectedTool) {
            console.log(`[AgentService] Granite selected tool: ${result.tool} (confidence: ${result.confidence})`);
            return selectedTool;
          }
        }
        
        console.warn('[AgentService] Granite did not return a valid tool, falling back to keyword matching');
      } catch (error) {
        console.warn('[AgentService] Granite tool selection failed, falling back to keyword matching:', error);
      }
    }

    // Fallback to keyword matching
    return this.selectToolByKeywords(query, tools);
  }

  /**
   * Fallback keyword-based tool selection
   */
  private selectToolByKeywords(query: string, tools: MCPTool[]): MCPTool | null {
    const lowerQuery = query.toLowerCase();

    // Check for leave balance queries
    if (lowerQuery.includes('leave') && lowerQuery.includes('balance')) {
      return tools.find((t) => t.name.includes('leave_balance')) || null;
    }

    // Check for leave request
    if (
      (lowerQuery.includes('request') || lowerQuery.includes('submit')) &&
      lowerQuery.includes('leave')
    ) {
      return tools.find((t) => t.name.includes('leave_request')) || null;
    }

    // Check for payroll queries
    if (lowerQuery.includes('payroll') || lowerQuery.includes('salary')) {
      return tools.find((t) => t.name.includes('payroll')) || null;
    }

    // Check for ticket creation
    if (
      (lowerQuery.includes('create') || lowerQuery.includes('open')) &&
      lowerQuery.includes('ticket')
    ) {
      return tools.find((t) => t.name.includes('ticket')) || null;
    }

    // Default: return first tool that might match
    return tools[0] || null;
  }

  /**
   * Extract parameters from query
   * Uses watsonx.ai Granite for intelligent parameter extraction with fallback
   */
  private async extractParameters(query: string, tool: MCPTool): Promise<any> {
    const useMockMode = process.env.WATSONX_MOCK_MODE === 'true';

    if (!useMockMode && watsonxService.isConfigured()) {
      try {
        console.log('[AgentService] Using watsonx.ai Granite for parameter extraction');
        const result = await watsonxService.processQuery(query, [tool]);
        
        if (result.parameters && Object.keys(result.parameters).length > 0) {
          console.log('[AgentService] Granite extracted parameters:', result.parameters);
          return result.parameters;
        }
        
        console.warn('[AgentService] Granite did not extract parameters, falling back to regex');
      } catch (error) {
        console.warn('[AgentService] Granite parameter extraction failed, falling back to regex:', error);
      }
    }

    // Fallback to regex-based extraction
    return this.extractParametersByRegex(query);
  }

  /**
   * Fallback regex-based parameter extraction
   */
  private extractParametersByRegex(query: string): any {
    const params: any = {};

    // Extract employee ID patterns (E101, E102, etc.)
    const employeeIdMatch = query.match(/E\d{3}/i);
    if (employeeIdMatch) {
      params.employee_id = employeeIdMatch[0].toUpperCase();
      params.id = employeeIdMatch[0].toUpperCase(); // Some tools use 'id'
    }

    // Extract number of days
    const daysMatch = query.match(/(\d+)\s*days?/i);
    if (daysMatch) {
      params.days = parseInt(daysMatch[1], 10);
    }

    // Extract leave type
    if (query.toLowerCase().includes('annual')) {
      params.leave_type = 'annual';
    } else if (query.toLowerCase().includes('sick')) {
      params.leave_type = 'sick';
    } else if (query.toLowerCase().includes('personal')) {
      params.leave_type = 'personal';
    }

    // Extract dates (simple pattern)
    const dateMatch = query.match(/\d{4}-\d{2}-\d{2}/g);
    if (dateMatch && dateMatch.length >= 2) {
      params.start_date = dateMatch[0];
      params.end_date = dateMatch[1];
    }

    return params;
  }

  /**
   * Execute a tool
   */
  private async executeTool(
    tool: MCPTool,
    parameters: any
  ): Promise<ToolExecutionResult> {
    try {
      // For MVP, we'll simulate tool execution with mock API
      // In production, this would call the actual MCP tool

      console.log(`[AgentService] Executing tool: ${tool.name} with params:`, parameters);

      // Simulate API call based on tool name
      let result: any;

      if (tool.name.includes('leave_balance')) {
        const employeeId = parameters.employee_id || parameters.id;
        if (!employeeId) {
          throw new Error('Employee ID is required');
        }
        const employee = mockApiService.getEmployee(employeeId);
        if (!employee) {
          throw new Error(`Employee ${employeeId} not found`);
        }
        result = {
          employeeId,
          employeeName: employee.name,
          leaveBalance: employee.leaveBalance,
        };
      } else if (tool.name.includes('leave_request')) {
        const employeeId = parameters.employee_id || parameters.id;
        if (!employeeId) {
          throw new Error('Employee ID is required');
        }
        result = {
          message: 'Leave request would be submitted',
          employeeId,
          leaveType: parameters.leave_type || 'annual',
          days: parameters.days || 5,
          status: 'pending',
        };
      } else if (tool.name.includes('payroll')) {
        const employeeId = parameters.employee_id || parameters.id;
        if (!employeeId) {
          throw new Error('Employee ID is required');
        }
        const employee = mockApiService.getEmployee(employeeId);
        if (!employee) {
          throw new Error(`Employee ${employeeId} not found`);
        }
        result = {
          employeeId,
          employeeName: employee.name,
          payroll: employee.payroll,
        };
      } else {
        result = {
          message: 'Tool executed successfully',
          tool: tool.name,
          parameters,
        };
      }

      return {
        success: true,
        data: result,
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[AgentService] Error executing tool ${tool.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Create approval request
   */
  private async createApprovalRequest(
    projectId: string,
    toolName: string,
    parameters: any,
    requestedBy: string
  ): Promise<Approval> {
    const storage = await readData<ApprovalsStorage>(APPROVALS_FILE);

    const approval: Approval = {
      id: uuidv4(),
      projectId,
      toolName,
      parameters,
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    storage.approvals.push(approval);
    await writeData(APPROVALS_FILE, storage);

    console.log(`[AgentService] Created approval request: ${approval.id}`);
    return approval;
  }

  /**
   * Get approval by ID
   */
  async getApproval(id: string): Promise<Approval | null> {
    const storage = await readData<ApprovalsStorage>(APPROVALS_FILE);
    return storage.approvals.find((a) => a.id === id) || null;
  }

  /**
   * List approvals for a project
   */
  async listApprovals(projectId: string, status?: string): Promise<Approval[]> {
    const storage = await readData<ApprovalsStorage>(APPROVALS_FILE);
    let approvals = storage.approvals.filter((a) => a.projectId === projectId);

    if (status) {
      approvals = approvals.filter((a) => a.status === status);
    }

    return approvals.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  /**
   * Approve a request
   */
  async approveRequest(
    id: string,
    approvedBy: string,
    reason?: string
  ): Promise<AgentResponse> {
    const storage = await readData<ApprovalsStorage>(APPROVALS_FILE);
    const approvalIndex = storage.approvals.findIndex((a) => a.id === id);

    if (approvalIndex === -1) {
      throw new Error(`Approval ${id} not found`);
    }

    const approval = storage.approvals[approvalIndex];

    if (approval.status !== 'pending') {
      throw new Error(`Approval ${id} is not pending`);
    }

    // Update approval status
    approval.status = 'approved';
    approval.approvedBy = approvedBy;
    approval.approvedAt = new Date().toISOString();
    approval.reason = reason;

    storage.approvals[approvalIndex] = approval;
    await writeData(APPROVALS_FILE, storage);

    // Execute the tool
    const tool = await toolPlannerService.getToolByName(approval.projectId, approval.toolName);

    if (!tool) {
      throw new Error(`Tool ${approval.toolName} not found`);
    }

    const result = await this.executeTool(tool, approval.parameters);

    console.log(`[AgentService] Approved and executed: ${approval.id}`);

    return {
      message: `Approval granted. Tool executed successfully.`,
      toolUsed: approval.toolName,
      parameters: approval.parameters,
      result: result.data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reject a request
   */
  async rejectRequest(id: string, rejectedBy: string, reason?: string): Promise<void> {
    const storage = await readData<ApprovalsStorage>(APPROVALS_FILE);
    const approvalIndex = storage.approvals.findIndex((a) => a.id === id);

    if (approvalIndex === -1) {
      throw new Error(`Approval ${id} not found`);
    }

    const approval = storage.approvals[approvalIndex];

    if (approval.status !== 'pending') {
      throw new Error(`Approval ${id} is not pending`);
    }

    approval.status = 'rejected';
    approval.rejectedBy = rejectedBy;
    approval.rejectedAt = new Date().toISOString();
    approval.reason = reason;

    storage.approvals[approvalIndex] = approval;
    await writeData(APPROVALS_FILE, storage);

    console.log(`[AgentService] Rejected approval: ${approval.id}`);
  }

  /**
   * Get pending approvals count
   */
  async getPendingApprovalsCount(projectId: string): Promise<number> {
    const approvals = await this.listApprovals(projectId, 'pending');
    return approvals.length;
  }
}

// Export singleton instance
export const agentService = new AgentService();

// Made with Bob
