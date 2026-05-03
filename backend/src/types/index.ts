import { z } from 'zod';

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  apiDocumentation: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'analyzing' | 'ready' | 'generated';
}

export interface CreateProjectDTO {
  name: string;
  description: string;
  apiDocumentation: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  apiDocumentation?: string;
  status?: Project['status'];
}

// ============================================================================
// Endpoint Types
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type OperationType = 'read' | 'write' | 'delete';
export type ParameterLocation = 'path' | 'query' | 'header' | 'body';

export interface Parameter {
  name: string;
  in: ParameterLocation;
  required: boolean;
  type: string;
  description?: string;
}

export interface Schema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  description?: string;
}

export interface Endpoint {
  id: string;
  projectId: string;
  method: HttpMethod;
  path: string;
  description: string;
  operationType: OperationType;
  sensitive: boolean;
  parameters?: Parameter[];
  requestBody?: Schema;
  responseBody?: Schema;
}

// ============================================================================
// MCP Tool Types
// ============================================================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MCPTool {
  id: string;
  projectId: string;
  endpointId: string;
  name: string;
  description: string;
  inputSchema: any; // Zod schema as object
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  riskReason: string;
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}

// ============================================================================
// Policy Types
// ============================================================================

export interface PolicyRule {
  condition: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}

export interface Policy {
  projectId: string;
  rules: PolicyRule[];
  defaultApprovalRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Approval Types
// ============================================================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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

export interface CreateApprovalDTO {
  projectId: string;
  toolName: string;
  parameters: any;
  requestedBy: string;
}

export interface UpdateApprovalDTO {
  status: ApprovalStatus;
  approvedBy?: string;
  rejectedBy?: string;
  reason?: string;
}

// ============================================================================
// Generated Files Types
// ============================================================================

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

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentQuery {
  query: string;
  projectId: string;
  userId?: string;
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

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executedAt: string;
}

// ============================================================================
// Template Types
// ============================================================================

export interface TemplateContext {
  projectName: string;
  projectVersion: string;
  tools: MCPTool[];
  endpoints: Endpoint[];
  policy: Policy;
  generatedAt: string;
}

export interface TemplateVariable {
  key: string;
  value: string;
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface ProjectsStorage {
  projects: Project[];
}

export interface EndpointsStorage {
  endpoints: Endpoint[];
}

export interface ToolsStorage {
  tools: MCPTool[];
}

export interface PoliciesStorage {
  policies: Policy[];
}

export interface ApprovalsStorage {
  approvals: Approval[];
}

// ============================================================================
// Parser Types
// ============================================================================

export interface ParsedEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  parameters: Parameter[];
  requestBody?: Schema;
  responseBody?: Schema;
}

export interface ParserResult {
  endpoints: ParsedEndpoint[];
  confidence: number;
  warnings: string[];
}

// ============================================================================
// Risk Engine Types
// ============================================================================

export interface RiskRule {
  name: string;
  condition: (endpoint: Endpoint, tool: MCPTool) => boolean;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}

export interface RiskMatrix {
  GET: {
    default: RiskLevel;
    sensitive: RiskLevel;
  };
  POST: RiskLevel;
  PUT: RiskLevel;
  PATCH: RiskLevel;
  DELETE: RiskLevel;
}

// ============================================================================
// Mock API Types
// ============================================================================

export interface MockEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
  payroll: {
    salary: number;
    lastPayment: string;
    nextPayment: string;
  };
}

export interface MockLeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface MockTicket {
  id: string;
  employeeId: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface MockHRData {
  employees: Record<string, MockEmployee>;
  leaveRequests: MockLeaveRequest[];
  tickets: MockTicket[];
}

// ============================================================================
// Test Types
// ============================================================================

export interface TestCase {
  name: string;
  description: string;
  input: any;
  expectedOutput?: any;
  shouldFail?: boolean;
  approvalRequired?: boolean;
}

export interface GeneratedTest {
  toolName: string;
  testCases: TestCase[];
  setupCode?: string;
  teardownCode?: string;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  includeTests: boolean;
  includeMockApi: boolean;
  includeDocumentation: boolean;
  format: 'zip' | 'tar';
}

export interface ExportResult {
  filename: string;
  size: number;
  files: string[];
  generatedAt: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class BobForgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'BobForgeError';
  }
}

export class ValidationError extends BobForgeError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BobForgeError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ParsingError extends BobForgeError {
  constructor(message: string, details?: any) {
    super(message, 'PARSING_ERROR', 422, details);
    this.name = 'ParsingError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// Made with Bob
