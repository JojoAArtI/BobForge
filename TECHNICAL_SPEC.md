# BobForge Technical Specification

## Project Overview
BobForge converts messy enterprise API documentation into secure, tested, and agent-ready MCP (Model Context Protocol) tools.

**Hackathon**: IBM Bob Dev Day Hackathon  
**Key Technologies**: IBM Bob IDE, watsonx.ai Granite (placeholder), TypeScript, Next.js, Express

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  Landing → Create → Analysis → Plan → Risk → Preview → Export│
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                   Backend (Express + TypeScript)             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Project      │  │ Parser       │  │ Tool Planner │     │
│  │ Service      │  │ Service      │  │ Service      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Risk Engine  │  │ MCP Generator│  │ Test         │     │
│  │ Service      │  │ Service      │  │ Service      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Mock API     │  │ Agent        │                        │
│  │ Service      │  │ Service      │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Data Storage (JSON Files)                 │
│  projects.json | endpoints.json | tools.json | policies.json│
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
bobforge/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── projectService.ts
│   │   │   ├── parserService.ts
│   │   │   ├── toolPlannerService.ts
│   │   │   ├── riskEngineService.ts
│   │   │   ├── mcpGeneratorService.ts
│   │   │   ├── mockApiService.ts
│   │   │   ├── testService.ts
│   │   │   └── agentService.ts
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── endpoints.ts
│   │   │   ├── tools.ts
│   │   │   ├── risk.ts
│   │   │   ├── generate.ts
│   │   │   ├── agent.ts
│   │   │   └── export.ts
│   │   ├── templates/
│   │   │   ├── mcp-server.template.ts
│   │   │   ├── mcp-tool.template.ts
│   │   │   ├── schema.template.ts
│   │   │   ├── test.template.ts
│   │   │   └── readme.template.md
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── data/
│   │   │   ├── projects.json
│   │   │   ├── endpoints.json
│   │   │   ├── tools.json
│   │   │   ├── policies.json
│   │   │   └── approvals.json
│   │   ├── utils/
│   │   │   ├── fileUtils.ts
│   │   │   └── zipUtils.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (landing)
│   │   │   ├── create/page.tsx
│   │   │   ├── projects/[id]/
│   │   │   │   ├── analysis/page.tsx
│   │   │   │   ├── plan/page.tsx
│   │   │   │   ├── risk/page.tsx
│   │   │   │   ├── preview/page.tsx
│   │   │   │   ├── playground/page.tsx
│   │   │   │   └── export/page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── EndpointList.tsx
│   │   │   ├── ToolCard.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   ├── CodePreview.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   └── ApprovalPanel.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── generated/
│   └── (MCP server outputs)
└── README.md
```

---

## Core Data Models

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  apiDocumentation: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'analyzing' | 'ready' | 'generated';
}
```

### Endpoint
```typescript
interface Endpoint {
  id: string;
  projectId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  operationType: 'read' | 'write' | 'delete';
  sensitive: boolean;
  parameters?: Parameter[];
  requestBody?: Schema;
  responseBody?: Schema;
}

interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  type: string;
  description?: string;
}
```

### MCPTool
```typescript
interface MCPTool {
  id: string;
  projectId: string;
  endpointId: string;
  name: string;
  description: string;
  inputSchema: ZodSchema;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  riskReason: string;
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

### Policy
```typescript
interface Policy {
  projectId: string;
  rules: PolicyRule[];
  defaultApprovalRequired: boolean;
}

interface PolicyRule {
  condition: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  reason: string;
}
```

### Approval
```typescript
interface Approval {
  id: string;
  projectId: string;
  toolName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
}
```

---

## Backend Services Specification

### 1. ProjectService
**Purpose**: Manage project lifecycle

**Methods**:
- `createProject(data: CreateProjectDTO): Project`
- `getProject(id: string): Project`
- `listProjects(): Project[]`
- `updateProject(id: string, data: Partial<Project>): Project`
- `deleteProject(id: string): void`

### 2. ParserService
**Purpose**: Extract endpoints from API documentation

**Methods**:
- `parseDocumentation(text: string): Endpoint[]`
  - **TODO**: Replace with watsonx.ai Granite call
  - For now: Use regex patterns + mock data

**Mock Implementation**:
```typescript
// Detect patterns like:
// GET /path/{param}
// POST /path
// Returns structured endpoints
```

### 3. ToolPlannerService
**Purpose**: Convert endpoints to MCP tools

**Methods**:
- `generateTools(endpoints: Endpoint[]): MCPTool[]`
- `generateToolName(endpoint: Endpoint): string`
- `generateInputSchema(endpoint: Endpoint): ZodSchema`

**Logic**:
- Convert REST path to function name: `/employees/{id}/leave-balance` → `check_leave_balance`
- Extract parameters from path and query
- Generate Zod schema for validation

### 4. RiskEngineService
**Purpose**: Assign risk levels and approval requirements

**Methods**:
- `assessRisk(tool: MCPTool, endpoint: Endpoint): RiskAssessment`
- `generatePolicy(tools: MCPTool[]): Policy`

**Risk Rules**:
```typescript
const RISK_RULES = {
  GET: {
    default: 'LOW',
    sensitive: 'MEDIUM'
  },
  POST: 'HIGH',
  PUT: 'HIGH',
  PATCH: 'HIGH',
  DELETE: 'CRITICAL'
};

const APPROVAL_RULES = {
  LOW: false,
  MEDIUM: false,
  HIGH: true,
  CRITICAL: true
};
```

### 5. MCPGeneratorService
**Purpose**: Generate MCP server code from templates

**Methods**:
- `generateServer(project: Project, tools: MCPTool[]): GeneratedFiles`
- `generateToolFile(tool: MCPTool): string`
- `generateSchemaFile(tools: MCPTool[]): string`
- `generatePolicyFile(policy: Policy): string`
- `generateReadme(project: Project): string`

**Templates**:
- Use string templates with placeholders
- Generate TypeScript files
- Include proper imports and types

### 6. MockApiService
**Purpose**: Create mock API for testing

**Methods**:
- `createMockServer(endpoints: Endpoint[]): Express.Application`
- `generateMockResponse(endpoint: Endpoint): any`

**Mock Data** (HR System):
```typescript
const MOCK_HR_DATA = {
  employees: {
    'E101': { name: 'John Doe', leaveBalance: 15, department: 'Engineering' },
    'E102': { name: 'Jane Smith', leaveBalance: 8, department: 'HR' }
  },
  leaveRequests: [],
  payroll: {}
};
```

### 7. TestService
**Purpose**: Generate test files

**Methods**:
- `generateTests(tools: MCPTool[]): TestFile[]`

**Test Cases**:
- Valid input
- Missing required parameters
- Approval required scenario
- Invalid data types

### 8. AgentService
**Purpose**: Handle agent playground interactions

**Methods**:
- `processQuery(query: string, projectId: string): AgentResponse`
- `selectTool(query: string, tools: MCPTool[]): MCPTool`
- `executeTool(tool: MCPTool, params: any): ToolResult`
- `checkApproval(tool: MCPTool): boolean`

**Flow**:
1. Parse user query
2. Select appropriate tool (mock selection for now)
3. Check risk policy
4. If approval required → create approval request
5. If approved or not required → execute tool
6. Return result

---

## API Routes Specification

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Endpoints
- `POST /api/projects/:id/parse` - Parse API docs
- `GET /api/projects/:id/endpoints` - Get endpoints

### Tools
- `POST /api/projects/:id/generate-tools` - Generate MCP tools
- `GET /api/projects/:id/tools` - Get tools

### Risk
- `POST /api/projects/:id/assess-risk` - Assess risk
- `GET /api/projects/:id/policy` - Get policy

### Generate
- `POST /api/projects/:id/generate` - Generate MCP server
- `GET /api/projects/:id/preview` - Preview generated code

### Agent
- `POST /api/projects/:id/agent/query` - Process agent query
- `POST /api/projects/:id/agent/execute` - Execute tool

### Approvals
- `GET /api/projects/:id/approvals` - List approvals
- `POST /api/approvals/:id/approve` - Approve request
- `POST /api/approvals/:id/reject` - Reject request

### Export
- `GET /api/projects/:id/export` - Download ZIP

---

## Frontend Pages Specification

### 1. Landing Page (`/`)
**Purpose**: Introduction and project list

**Components**:
- Hero section with BobForge description
- Feature highlights
- List of existing projects
- "Create New Project" button

### 2. Create Project (`/create`)
**Purpose**: Input API documentation

**Components**:
- Project name input
- Description textarea
- API documentation textarea (large)
- "Analyze" button

**Flow**:
1. User enters project details
2. Pastes API documentation
3. Clicks "Analyze"
4. Redirects to analysis page

### 3. API Analysis (`/projects/[id]/analysis`)
**Purpose**: Show extracted endpoints

**Components**:
- Endpoint list with method badges
- Path, description, parameters
- "Generate Tools" button

**Data**: Parsed endpoints from backend

### 4. MCP Tool Plan (`/projects/[id]/plan`)
**Purpose**: Show generated MCP tools

**Components**:
- Tool cards with name, description
- Input schema preview
- "Assess Risk" button

### 5. Risk Review (`/projects/[id]/risk`)
**Purpose**: Show risk assessment

**Components**:
- Tool list with risk badges (color-coded)
- Approval requirements
- Risk reasons
- Policy summary
- "Generate Code" button

### 6. Code Preview (`/projects/[id]/preview`)
**Purpose**: Show generated MCP server code

**Components**:
- File tree
- Code viewer with syntax highlighting
- "Test in Playground" button

### 7. Agent Playground (`/projects/[id]/playground`)
**Purpose**: Test MCP tools with AI agent

**Components**:
- Chat interface
- Message history
- Tool execution logs
- Approval panel (if needed)

**Interactions**:
- User types query
- Agent selects tool
- Shows risk check
- Executes or requests approval

### 8. Export (`/projects/[id]/export`)
**Purpose**: Download generated code

**Components**:
- Summary of generated files
- "Download ZIP" button
- Installation instructions

---

## MCP Server Template Structure

### Generated Output
```
mcp-server-{project-name}/
├── src/
│   ├── index.ts (main server)
│   ├── tools/
│   │   ├── check_leave_balance.ts
│   │   ├── request_leave.ts
│   │   └── ...
│   ├── schemas/
│   │   └── index.ts (Zod schemas)
│   └── policy.json
├── tests/
│   ├── check_leave_balance.test.ts
│   └── ...
├── package.json
├── tsconfig.json
└── README.md
```

### Server Template
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { checkLeaveBalance } from './tools/check_leave_balance.js';
import { requestLeave } from './tools/request_leave.js';

const server = new Server({
  name: '{PROJECT_NAME}',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// Register tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'check_leave_balance':
      return checkLeaveBalance(args);
    case 'request_leave':
      return requestLeave(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Tool Template
```typescript
import { z } from 'zod';

export const CheckLeaveBalanceSchema = z.object({
  employee_id: z.string().describe('Employee ID')
});

export async function checkLeaveBalance(args: z.infer<typeof CheckLeaveBalanceSchema>) {
  // TODO: Replace with actual API call
  const mockResponse = {
    employee_id: args.employee_id,
    leave_balance: 15,
    leave_type: 'annual'
  };
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(mockResponse, null, 2)
      }
    ]
  };
}
```

---

## Mock HR API Endpoints

### Endpoints
1. `GET /api/hr/employees/:id/leave-balance`
2. `POST /api/hr/employees/:id/leave-request`
3. `GET /api/hr/employees/:id/payroll`
4. `POST /api/hr/tickets`
5. `GET /api/hr/tickets/:id`

### Sample Data
```typescript
const HR_DATA = {
  employees: {
    'E101': {
      id: 'E101',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      leaveBalance: {
        annual: 15,
        sick: 10,
        personal: 5
      },
      payroll: {
        salary: 75000,
        lastPayment: '2026-04-30',
        nextPayment: '2026-05-31'
      }
    },
    'E102': {
      id: 'E102',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'HR',
      leaveBalance: {
        annual: 8,
        sick: 12,
        personal: 3
      },
      payroll: {
        salary: 68000,
        lastPayment: '2026-04-30',
        nextPayment: '2026-05-31'
      }
    }
  },
  leaveRequests: [],
  tickets: []
};
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **File Operations**: fs-extra
- **ZIP Generation**: archiver
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (optional)
- **State Management**: React hooks
- **API Client**: fetch / axios

### Development
- **IDE**: IBM Bob IDE
- **AI Integration**: watsonx.ai Granite (placeholder)
- **Version Control**: Git

---

## Implementation Phases

### Phase 1: Foundation (Steps 1-3)
- Project structure
- Package setup
- Type definitions
- Basic routing

### Phase 2: Backend Core (Steps 4-7)
- All services implementation
- API routes
- Data storage
- Templates

### Phase 3: Frontend (Steps 9-12)
- Next.js setup
- All pages
- Components
- API integration

### Phase 4: Features (Steps 13-15)
- Agent playground
- Approval system
- Export functionality

### Phase 5: Polish (Steps 16-17)
- Documentation
- Testing
- Demo preparation

---

## Key Differentiators

1. **Enterprise Safety**: Risk scoring + approval layer
2. **Template-Based Generation**: Not raw AI code generation
3. **End-to-End Pipeline**: Docs → MCP → Tests → Playground
4. **Agent-Ready**: Built for AI agent consumption
5. **IBM Integration**: Bob IDE + watsonx.ai Granite

---

## Success Criteria

- [ ] Parse API docs into structured endpoints
- [ ] Generate MCP tools with proper schemas
- [ ] Assign risk levels correctly
- [ ] Generate working MCP server code
- [ ] Create functional agent playground
- [ ] Implement approval workflow
- [ ] Export complete ZIP package
- [ ] Demo with HR use case

---

## Next Steps

1. Initialize project structure
2. Set up package.json files
3. Create type definitions
4. Implement services one by one
5. Build frontend pages
6. Test end-to-end flow
7. Prepare demo

---

**Note**: This is an MVP for a hackathon. Focus on working end-to-end flow with mock data. watsonx.ai integration will be added as TODO comments for future implementation.