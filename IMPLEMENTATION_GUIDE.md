# BobForge Implementation Guide

This guide provides detailed implementation instructions for each component of BobForge.

---

## Quick Start Checklist

Before starting implementation, ensure you have:
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] IBM Bob IDE set up
- [ ] Git initialized
- [ ] Read TECHNICAL_SPEC.md

---

## Step-by-Step Implementation

### Step 1: Project Structure Setup

Create the following directory structure:

```bash
mkdir -p bobforge/{backend,frontend,generated}
mkdir -p bobforge/backend/src/{services,routes,templates,types,data,utils}
mkdir -p bobforge/frontend/src/{app,components,lib,types}
```

### Step 2: Backend Package Configuration

**File**: `backend/package.json`

```json
{
  "name": "bobforge-backend",
  "version": "1.0.0",
  "description": "BobForge Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "zod": "^3.22.4",
    "uuid": "^9.0.1",
    "archiver": "^6.0.1",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "@types/uuid": "^9.0.7",
    "@types/archiver": "^6.0.2",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11"
  }
}
```

**File**: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Frontend Package Configuration

**File**: `frontend/package.json`

```json
{
  "name": "bobforge-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.4",
    "axios": "^1.6.2",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.4"
  }
}
```

**File**: `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**File**: `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f62fe',
        secondary: '#393939',
        success: '#24a148',
        warning: '#f1c21b',
        danger: '#da1e28',
      },
    },
  },
  plugins: [],
}
```

---

## Core Type Definitions

**File**: `backend/src/types/index.ts`

```typescript
import { z } from 'zod';

// Project Types
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

// Endpoint Types
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

// MCP Tool Types
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

// Policy Types
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
}

// Approval Types
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
  reason?: string;
}

// Generated Files Types
export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratedFiles {
  files: GeneratedFile[];
  structure: string[];
}

// Agent Types
export interface AgentQuery {
  query: string;
  projectId: string;
}

export interface AgentResponse {
  message: string;
  toolUsed?: string;
  result?: any;
  approvalRequired?: boolean;
  approvalId?: string;
  error?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}
```

---

## Service Implementation Details

### ProjectService Implementation

**File**: `backend/src/services/projectService.ts`

Key responsibilities:
- CRUD operations for projects
- Store in `data/projects.json`
- Generate unique IDs using uuid
- Validate input data

Methods to implement:
```typescript
createProject(data: CreateProjectDTO): Project
getProject(id: string): Project | null
listProjects(): Project[]
updateProject(id: string, updates: Partial<Project>): Project
deleteProject(id: string): boolean
```

### ParserService Implementation

**File**: `backend/src/services/parserService.ts`

Key responsibilities:
- Parse API documentation text
- Extract endpoints using regex patterns
- Return structured endpoint objects

**TODO: watsonx.ai Granite Integration**
```typescript
// TODO: Replace mock implementation with watsonx.ai Granite call
// This should use IBM watsonx.ai to intelligently parse API docs
// For now, using pattern matching and mock data
```

Patterns to detect:
- `GET /path/{param}` → GET endpoint with path parameter
- `POST /path` → POST endpoint
- Extract descriptions from surrounding text
- Identify sensitive operations (payroll, admin, etc.)

### ToolPlannerService Implementation

**File**: `backend/src/services/toolPlannerService.ts`

Key responsibilities:
- Convert endpoints to MCP tool definitions
- Generate tool names (snake_case from path)
- Create Zod input schemas
- Generate descriptions

Naming convention:
```
/employees/{id}/leave-balance → check_leave_balance
/employees/{id}/leave-request → request_leave
/hr/tickets → create_hr_ticket
```

Schema generation:
```typescript
// Path params become required string fields
// Query params become optional fields
// Body params become nested object
```

### RiskEngineService Implementation

**File**: `backend/src/services/riskEngineService.ts`

Risk assessment logic:
```typescript
const RISK_MATRIX = {
  GET: {
    default: 'LOW',
    sensitive: 'MEDIUM'  // payroll, admin, personal
  },
  POST: 'HIGH',
  PUT: 'HIGH',
  PATCH: 'HIGH',
  DELETE: 'CRITICAL'
};

const SENSITIVE_KEYWORDS = [
  'payroll', 'salary', 'admin', 'delete', 
  'terminate', 'fire', 'confidential'
];
```

Approval rules:
- LOW/MEDIUM: No approval needed
- HIGH/CRITICAL: Approval required

### MCPGeneratorService Implementation

**File**: `backend/src/services/mcpGeneratorService.ts`

Template-based generation:
1. Load templates from `templates/` directory
2. Replace placeholders with actual values
3. Generate file structure
4. Return GeneratedFiles object

Templates needed:
- `mcp-server.template.ts` - Main server file
- `mcp-tool.template.ts` - Individual tool file
- `schema.template.ts` - Zod schemas
- `test.template.ts` - Test file
- `readme.template.md` - Documentation

### MockApiService Implementation

**File**: `backend/src/services/mockApiService.ts`

Create Express router with mock endpoints:
```typescript
const router = express.Router();

// Mock HR data
const HR_DATA = { ... };

// Generate routes based on endpoints
endpoints.forEach(endpoint => {
  router[endpoint.method.toLowerCase()](
    endpoint.path,
    (req, res) => {
      // Return mock data
    }
  );
});
```

### TestService Implementation

**File**: `backend/src/services/testService.ts`

Generate Jest test files:
```typescript
describe('Tool: ${toolName}', () => {
  test('should execute with valid input', async () => {
    // Test valid case
  });
  
  test('should fail with missing parameters', async () => {
    // Test validation
  });
  
  test('should require approval for high-risk operations', async () => {
    // Test approval flow
  });
});
```

### AgentService Implementation

**File**: `backend/src/services/agentService.ts`

Agent query processing:
1. Parse user query
2. Select appropriate tool (keyword matching for MVP)
3. Extract parameters from query
4. Check risk policy
5. If approval required → create approval request
6. If approved → execute tool
7. Return formatted response

Tool selection logic (mock):
```typescript
// Simple keyword matching
if (query.includes('leave balance')) return 'check_leave_balance';
if (query.includes('request leave')) return 'request_leave';
if (query.includes('payroll')) return 'check_payroll';
```

---

## API Routes Implementation

### Projects Routes

**File**: `backend/src/routes/projects.ts`

```typescript
import express from 'express';
import { projectService } from '../services/projectService';

const router = express.Router();

router.post('/', async (req, res) => {
  // Create project
});

router.get('/', async (req, res) => {
  // List projects
});

router.get('/:id', async (req, res) => {
  // Get project
});

router.put('/:id', async (req, res) => {
  // Update project
});

router.delete('/:id', async (req, res) => {
  // Delete project
});

export default router;
```

### Endpoints Routes

**File**: `backend/src/routes/endpoints.ts`

```typescript
router.post('/:projectId/parse', async (req, res) => {
  // Parse API documentation
  const { apiDocumentation } = req.body;
  const endpoints = await parserService.parseDocumentation(apiDocumentation);
  // Save endpoints
  res.json({ endpoints });
});

router.get('/:projectId/endpoints', async (req, res) => {
  // Get endpoints for project
});
```

### Tools Routes

**File**: `backend/src/routes/tools.ts`

```typescript
router.post('/:projectId/generate-tools', async (req, res) => {
  // Generate MCP tools from endpoints
});

router.get('/:projectId/tools', async (req, res) => {
  // Get tools for project
});
```

### Risk Routes

**File**: `backend/src/routes/risk.ts`

```typescript
router.post('/:projectId/assess-risk', async (req, res) => {
  // Assess risk for all tools
});

router.get('/:projectId/policy', async (req, res) => {
  // Get risk policy
});
```

### Generate Routes

**File**: `backend/src/routes/generate.ts`

```typescript
router.post('/:projectId/generate', async (req, res) => {
  // Generate MCP server code
});

router.get('/:projectId/preview', async (req, res) => {
  // Preview generated code
});
```

### Agent Routes

**File**: `backend/src/routes/agent.ts`

```typescript
router.post('/:projectId/query', async (req, res) => {
  // Process agent query
});

router.post('/:projectId/execute', async (req, res) => {
  // Execute tool
});
```

### Export Routes

**File**: `backend/src/routes/export.ts`

```typescript
router.get('/:projectId/export', async (req, res) => {
  // Generate and download ZIP
  const zip = await generateZip(projectId);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=mcp-server-${projectId}.zip`);
  zip.pipe(res);
});
```

---

## Frontend Implementation Details

### API Client

**File**: `frontend/src/lib/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  projects: {
    create: (data) => axios.post(`${API_BASE_URL}/projects`, data),
    list: () => axios.get(`${API_BASE_URL}/projects`),
    get: (id) => axios.get(`${API_BASE_URL}/projects/${id}`),
    update: (id, data) => axios.put(`${API_BASE_URL}/projects/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/projects/${id}`),
  },
  endpoints: {
    parse: (projectId, apiDocs) => 
      axios.post(`${API_BASE_URL}/projects/${projectId}/parse`, { apiDocumentation: apiDocs }),
    list: (projectId) => 
      axios.get(`${API_BASE_URL}/projects/${projectId}/endpoints`),
  },
  tools: {
    generate: (projectId) => 
      axios.post(`${API_BASE_URL}/projects/${projectId}/generate-tools`),
    list: (projectId) => 
      axios.get(`${API_BASE_URL}/projects/${projectId}/tools`),
  },
  risk: {
    assess: (projectId) => 
      axios.post(`${API_BASE_URL}/projects/${projectId}/assess-risk`),
    getPolicy: (projectId) => 
      axios.get(`${API_BASE_URL}/projects/${projectId}/policy`),
  },
  generate: {
    code: (projectId) => 
      axios.post(`${API_BASE_URL}/projects/${projectId}/generate`),
    preview: (projectId) => 
      axios.get(`${API_BASE_URL}/projects/${projectId}/preview`),
  },
  agent: {
    query: (projectId, query) => 
      axios.post(`${API_BASE_URL}/projects/${projectId}/agent/query`, { query }),
  },
  export: {
    download: (projectId) => 
      `${API_BASE_URL}/projects/${projectId}/export`,
  },
};
```

### Component Structure

**Key Components**:

1. **Header.tsx** - Navigation and branding
2. **ProjectCard.tsx** - Display project summary
3. **EndpointList.tsx** - List of parsed endpoints
4. **ToolCard.tsx** - Display MCP tool details
5. **RiskBadge.tsx** - Color-coded risk indicator
6. **CodePreview.tsx** - Syntax-highlighted code viewer
7. **ChatInterface.tsx** - Agent playground chat
8. **ApprovalPanel.tsx** - Approval request UI

### Page Flow

```
Landing (/) 
  → Create (/create)
    → Analysis (/projects/[id]/analysis)
      → Plan (/projects/[id]/plan)
        → Risk (/projects/[id]/risk)
          → Preview (/projects/[id]/preview)
            → Playground (/projects/[id]/playground)
              → Export (/projects/[id]/export)
```

---

## Data Storage Structure

### projects.json
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "HR System API",
      "description": "Employee management endpoints",
      "apiDocumentation": "...",
      "createdAt": "2026-05-03T00:00:00Z",
      "updatedAt": "2026-05-03T00:00:00Z",
      "status": "ready"
    }
  ]
}
```

### endpoints.json
```json
{
  "endpoints": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "method": "GET",
      "path": "/employees/{id}/leave-balance",
      "description": "Check employee leave balance",
      "operationType": "read",
      "sensitive": false,
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "type": "string",
          "description": "Employee ID"
        }
      ]
    }
  ]
}
```

### tools.json
```json
{
  "tools": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "endpointId": "uuid",
      "name": "check_leave_balance",
      "description": "Check employee leave balance",
      "inputSchema": { /* Zod schema */ },
      "riskLevel": "LOW",
      "approvalRequired": false,
      "riskReason": "Read-only operation with no sensitive data"
    }
  ]
}
```

### policies.json
```json
{
  "policies": [
    {
      "projectId": "uuid",
      "rules": [
        {
          "condition": "method === 'DELETE'",
          "riskLevel": "CRITICAL",
          "approvalRequired": true,
          "reason": "Destructive operation"
        }
      ],
      "defaultApprovalRequired": false
    }
  ]
}
```

### approvals.json
```json
{
  "approvals": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "toolName": "request_leave",
      "parameters": { "employee_id": "E101", "days": 5 },
      "requestedBy": "agent",
      "requestedAt": "2026-05-03T00:00:00Z",
      "status": "pending"
    }
  ]
}
```

---

## Testing Strategy

### Backend Tests
- Unit tests for each service
- Integration tests for API routes
- Mock data validation

### Frontend Tests
- Component rendering tests
- User interaction tests
- API integration tests

### E2E Tests
- Complete workflow from docs to export
- Agent playground interactions
- Approval workflow

---

## Demo Preparation

### Sample API Documentation

```
HR System API Documentation

Employee Leave Management

GET /employees/{id}/leave-balance
Returns the current leave balance for an employee.
Parameters:
- id (path, required): Employee ID

POST /employees/{id}/leave-request
Submit a new leave request for an employee.
Parameters:
- id (path, required): Employee ID
Body:
- leave_type: string (annual, sick, personal)
- start_date: string (YYYY-MM-DD)
- end_date: string (YYYY-MM-DD)
- reason: string

GET /employees/{id}/payroll
Get payroll information for an employee.
Parameters:
- id (path, required): Employee ID

POST /hr/tickets
Create a new HR support ticket.
Body:
- employee_id: string
- category: string
- subject: string
- description: string
```

### Demo Script

1. **Create Project**: Paste HR API docs
2. **View Analysis**: Show parsed endpoints
3. **Review Tools**: Display generated MCP tools
4. **Check Risk**: Show risk levels and approval requirements
5. **Preview Code**: Display generated MCP server
6. **Test Playground**: 
   - Query: "How many leaves does employee E102 have?"
   - Query: "Submit leave request for E101"
   - Show approval flow
7. **Export**: Download ZIP file

---

## Deployment Considerations

### Environment Variables

**Backend** (`.env`):
```
PORT=3001
NODE_ENV=development
DATA_DIR=./src/data
GENERATED_DIR=../generated
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

---

## Future Enhancements (Post-Hackathon)

1. **watsonx.ai Integration**
   - Replace mock parser with Granite model
   - Intelligent endpoint extraction
   - Natural language tool selection

2. **Advanced Features**
   - Multi-user support
   - Role-based access control
   - Audit logging
   - Real API testing
   - Custom risk rules

3. **UI Improvements**
   - Dark mode
   - Code editor with IntelliSense
   - Real-time collaboration
   - Advanced filtering

4. **MCP Enhancements**
   - Support for more protocols
   - Custom tool templates
   - Tool versioning
   - Dependency management

---

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change PORT in .env
2. **CORS errors**: Check CORS configuration in backend
3. **File permissions**: Ensure write access to data/ and generated/
4. **TypeScript errors**: Run `npm install` in both directories

### Debug Mode

Enable verbose logging:
```typescript
// backend/src/server.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

## Success Metrics

- [ ] Parse API docs successfully
- [ ] Generate valid MCP tools
- [ ] Assign correct risk levels
- [ ] Generate working TypeScript code
- [ ] Agent can execute tools
- [ ] Approval workflow functions
- [ ] Export produces valid ZIP
- [ ] Demo runs smoothly

---

**Ready to implement!** Start with Step 2 (project structure) and proceed incrementally through each service and component.