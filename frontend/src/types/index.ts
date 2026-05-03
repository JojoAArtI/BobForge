// Frontend Type Definitions for BobForge

export type ProjectStatus = 'draft' | 'analyzing' | 'ready' | 'generated';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Project {
  id: string;
  name: string;
  description: string;
  apiDocumentation: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
}

export interface Endpoint {
  id: string;
  projectId: string;
  method: HttpMethod;
  path: string;
  description: string;
  operationType: 'read' | 'write' | 'delete';
  sensitive: boolean;
  parameters?: Parameter[];
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description?: string;
}

export interface MCPTool {
  id: string;
  projectId: string;
  endpointId: string;
  name: string;
  description: string;
  inputSchema: any;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  riskReason: string;
}

export interface Policy {
  projectId: string;
  rules: PolicyRule[];
  defaultApprovalRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  condition: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}

export interface RiskPolicy {
  projectId: string;
  rules: RiskRule[];
  defaultApprovalRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAssessment {
  toolName: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}

export interface RiskRule {
  condition: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}

export interface Approval {
  id: string;
  projectId: string;
  toolName: string;
  parameters: any;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  reason?: string;
}

export interface AgentResponse {
  message: string;
  toolUsed?: string;
  toolDescription?: string;
  parameters?: any;
  result?: any;
  approvalRequired?: boolean;
  approvalId?: string;
  riskLevel?: RiskLevel;
  error?: string;
  timestamp: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'typescript' | 'json' | 'markdown' | 'text';
}

export interface GeneratedFiles {
  files: GeneratedFile[];
  structure: string[];
  projectId: string;
  generatedAt: string;
}

export interface ProjectStatistics {
  endpoints: number;
  tools: number;
  riskDistribution: Record<RiskLevel, number>;
  pendingApprovals: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

// Made with Bob
