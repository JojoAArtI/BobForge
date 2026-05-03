import { v4 as uuidv4 } from 'uuid';
import {
  Endpoint,
  MCPTool,
  RiskLevel,
  RiskAssessment,
  Policy,
  PolicyRule,
  PoliciesStorage,
  RiskMatrix,
} from '../types';
import { readData, writeData } from '../utils/fileUtils';
import { toolPlannerService } from './toolPlannerService';

const POLICIES_FILE = 'policies.json';

// Risk assessment matrix
const RISK_MATRIX: RiskMatrix = {
  GET: {
    default: 'LOW',
    sensitive: 'MEDIUM',
  },
  POST: 'HIGH',
  PUT: 'HIGH',
  PATCH: 'HIGH',
  DELETE: 'CRITICAL',
};

// Sensitive keywords
const SENSITIVE_KEYWORDS = [
  'payroll',
  'salary',
  'admin',
  'password',
  'secret',
  'token',
  'confidential',
  'personal',
  'private',
  'credit',
  'payment',
  'delete',
  'terminate',
  'fire',
];

/**
 * Risk Engine Service
 * Assesses risk levels and generates policies
 */
class RiskEngineService {
  /**
   * Assess risk for all tools in a project
   */
  async assessRisk(projectId: string, tools: MCPTool[], endpoints: Endpoint[]): Promise<Policy> {
    console.log(`[RiskEngineService] Assessing risk for ${tools.length} tools`);

    const rules: PolicyRule[] = [];

    // Assess each tool
    for (const tool of tools) {
      const endpoint = endpoints.find((e) => e.id === tool.endpointId);
      if (!endpoint) {
        console.warn(`[RiskEngineService] Endpoint not found for tool ${tool.id}`);
        continue;
      }

      const assessment = this.assessToolRisk(tool, endpoint);

      // Update tool with risk assessment
      await toolPlannerService.updateTool(tool.id, {
        riskLevel: assessment.riskLevel,
        approvalRequired: assessment.approvalRequired,
        riskReason: assessment.reason,
      });

      // Create policy rule
      rules.push({
        condition: `tool.name === '${tool.name}'`,
        riskLevel: assessment.riskLevel,
        approvalRequired: assessment.approvalRequired,
        reason: assessment.reason,
      });
    }

    // Create policy
    const policy: Policy = {
      projectId,
      rules,
      defaultApprovalRequired: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save policy
    await this.savePolicy(policy);

    console.log(`[RiskEngineService] Risk assessment complete. Created ${rules.length} rules`);
    return policy;
  }

  /**
   * Assess risk for a single tool
   */
  private assessToolRisk(tool: MCPTool, endpoint: Endpoint): RiskAssessment {
    let riskLevel: RiskLevel;
    let reason: string;

    // Check HTTP method
    if (endpoint.method === 'GET') {
      // GET requests are generally safer
      if (endpoint.sensitive || this.containsSensitiveKeywords(endpoint)) {
        riskLevel = RISK_MATRIX.GET.sensitive;
        reason = 'Read operation accessing sensitive data';
      } else {
        riskLevel = RISK_MATRIX.GET.default;
        reason = 'Safe read-only operation';
      }
    } else if (endpoint.method === 'DELETE') {
      riskLevel = RISK_MATRIX.DELETE;
      reason = 'Destructive operation that permanently removes data';
    } else {
      // POST, PUT, PATCH
      riskLevel = RISK_MATRIX[endpoint.method];
      
      if (this.containsSensitiveKeywords(endpoint)) {
        // Upgrade to CRITICAL if dealing with sensitive data
        riskLevel = 'CRITICAL';
        reason = 'Modifies sensitive data (payroll, admin, etc.)';
      } else {
        reason = 'Modifies or creates data';
      }
    }

    // Determine if approval is required
    const approvalRequired = this.requiresApproval(riskLevel);

    return {
      riskLevel,
      approvalRequired,
      reason,
    };
  }

  /**
   * Check if endpoint contains sensitive keywords
   */
  private containsSensitiveKeywords(endpoint: Endpoint): boolean {
    const text = `${endpoint.path} ${endpoint.description}`.toLowerCase();
    return SENSITIVE_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  /**
   * Determine if approval is required based on risk level
   */
  private requiresApproval(riskLevel: RiskLevel): boolean {
    return riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  }

  /**
   * Save policy to storage
   */
  private async savePolicy(policy: Policy): Promise<void> {
    const storage = await readData<PoliciesStorage>(POLICIES_FILE);

    // Remove existing policy for this project
    storage.policies = storage.policies.filter((p) => p.projectId !== policy.projectId);

    // Add new policy
    storage.policies.push(policy);

    await writeData(POLICIES_FILE, storage);
  }

  /**
   * Get policy for a project
   */
  async getPolicy(projectId: string): Promise<Policy | null> {
    const storage = await readData<PoliciesStorage>(POLICIES_FILE);
    return storage.policies.find((p) => p.projectId === projectId) || null;
  }

  /**
   * Check if a tool requires approval
   */
  async checkApprovalRequired(projectId: string, toolName: string): Promise<boolean> {
    const policy = await this.getPolicy(projectId);
    
    if (!policy) {
      return false;
    }

    // Find matching rule
    const rule = policy.rules.find((r) => r.condition.includes(toolName));
    
    if (rule) {
      return rule.approvalRequired;
    }

    return policy.defaultApprovalRequired;
  }

  /**
   * Get risk level for a tool
   */
  async getRiskLevel(projectId: string, toolName: string): Promise<RiskLevel | null> {
    const policy = await this.getPolicy(projectId);
    
    if (!policy) {
      return null;
    }

    // Find matching rule
    const rule = policy.rules.find((r) => r.condition.includes(toolName));
    
    return rule ? rule.riskLevel : null;
  }

  /**
   * Update policy
   */
  async updatePolicy(projectId: string, updates: Partial<Policy>): Promise<Policy> {
    const storage = await readData<PoliciesStorage>(POLICIES_FILE);
    const policyIndex = storage.policies.findIndex((p) => p.projectId === projectId);

    if (policyIndex === -1) {
      throw new Error(`Policy for project ${projectId} not found`);
    }

    storage.policies[policyIndex] = {
      ...storage.policies[policyIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await writeData(POLICIES_FILE, storage);
    return storage.policies[policyIndex];
  }

  /**
   * Delete policy for a project
   */
  async deletePolicy(projectId: string): Promise<void> {
    const storage = await readData<PoliciesStorage>(POLICIES_FILE);
    storage.policies = storage.policies.filter((p) => p.projectId !== projectId);
    await writeData(POLICIES_FILE, storage);
  }

  /**
   * Get risk statistics for a project
   */
  async getRiskStatistics(projectId: string): Promise<Record<RiskLevel, number>> {
    const policy = await this.getPolicy(projectId);
    
    const stats: Record<RiskLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    if (policy) {
      for (const rule of policy.rules) {
        stats[rule.riskLevel]++;
      }
    }

    return stats;
  }

  /**
   * Get tools requiring approval
   */
  async getToolsRequiringApproval(projectId: string): Promise<string[]> {
    const policy = await this.getPolicy(projectId);
    
    if (!policy) {
      return [];
    }

    return policy.rules
      .filter((r) => r.approvalRequired)
      .map((r) => {
        // Extract tool name from condition
        const match = r.condition.match(/tool\.name === '([^']+)'/);
        return match ? match[1] : '';
      })
      .filter((name) => name.length > 0);
  }
}

// Export singleton instance
export const riskEngineService = new RiskEngineService();

// Made with Bob
