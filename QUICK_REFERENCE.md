# BobForge Quick Reference Guide

Quick lookup for common tasks, commands, and code patterns.

---

## 🚀 Quick Start Commands

```bash
# Initial Setup
npm install                    # Install dependencies
npm run dev                    # Start development server

# Backend (Port 3001)
cd backend
npm install
npm run dev                    # Start with hot reload
npm run build                  # Build for production
npm start                      # Run production build
npm test                       # Run tests

# Frontend (Port 3000)
cd frontend
npm install
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production
npm start                      # Run production build
npm run lint                   # Run ESLint
```

---

## 📁 File Locations

### Backend
```
backend/src/
├── services/          # Business logic
│   ├── projectService.ts
│   ├── parserService.ts
│   ├── toolPlannerService.ts
│   ├── riskEngineService.ts
│   ├── mcpGeneratorService.ts
│   ├── mockApiService.ts
│   ├── testService.ts
│   └── agentService.ts
├── routes/            # API endpoints
├── templates/         # Code generation templates
├── types/            # TypeScript definitions
├── data/             # JSON storage
└── server.ts         # Entry point
```

### Frontend
```
frontend/src/
├── app/              # Pages (App Router)
│   ├── page.tsx                    # Landing
│   ├── create/page.tsx             # Create project
│   └── projects/[id]/
│       ├── analysis/page.tsx       # API analysis
│       ├── plan/page.tsx           # Tool plan
│       ├── risk/page.tsx           # Risk review
│       ├── preview/page.tsx        # Code preview
│       ├── playground/page.tsx     # Agent playground
│       └── export/page.tsx         # Export
├── components/       # React components
├── lib/             # API client
└── types/           # TypeScript definitions
```

---

## 🔌 API Endpoints

### Projects
```typescript
POST   /api/projects              // Create project
GET    /api/projects              // List all projects
GET    /api/projects/:id          // Get project by ID
PUT    /api/projects/:id          // Update project
DELETE /api/projects/:id          // Delete project
```

### Endpoints
```typescript
POST   /api/projects/:id/parse    // Parse API documentation
GET    /api/projects/:id/endpoints // Get parsed endpoints
```

### Tools
```typescript
POST   /api/projects/:id/generate-tools // Generate MCP tools
GET    /api/projects/:id/tools          // Get generated tools
```

### Risk
```typescript
POST   /api/projects/:id/assess-risk // Assess risk levels
GET    /api/projects/:id/policy      // Get risk policy
```

### Generate
```typescript
POST   /api/projects/:id/generate // Generate MCP server code
GET    /api/projects/:id/preview  // Preview generated code
```

### Agent
```typescript
POST   /api/projects/:id/agent/query   // Process agent query
POST   /api/projects/:id/agent/execute // Execute tool
```

### Approvals
```typescript
GET    /api/projects/:id/approvals     // List approvals
POST   /api/approvals/:id/approve      // Approve request
POST   /api/approvals/:id/reject       // Reject request
```

### Export
```typescript
GET    /api/projects/:id/export // Download ZIP file
```

---

## 📊 Data Models

### Project
```typescript
{
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
{
  id: string;
  projectId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  operationType: 'read' | 'write' | 'delete';
  sensitive: boolean;
  parameters?: Parameter[];
}
```

### MCPTool
```typescript
{
  id: string;
  projectId: string;
  endpointId: string;
  name: string;
  description: string;
  inputSchema: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approvalRequired: boolean;
  riskReason: string;
}
```

### Approval
```typescript
{
  id: string;
  projectId: string;
  toolName: string;
  parameters: any;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}
```

---

## 🎨 Risk Level Colors

```typescript
const RISK_COLORS = {
  LOW: '#90EE90',      // Light Green
  MEDIUM: '#FFD700',   // Gold
  HIGH: '#FFA500',     // Orange
  CRITICAL: '#FF6347'  // Tomato Red
};

// Tailwind classes
const RISK_CLASSES = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
};
```

---

## 🔧 Common Code Patterns

### Reading JSON Data
```typescript
import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readJson(filePath);
  return data;
}

async function writeData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeJson(filePath, data, { spaces: 2 });
}
```

### API Client Usage (Frontend)
```typescript
import { api } from '@/lib/api';

// Create project
const project = await api.projects.create({
  name: 'My Project',
  description: 'Description',
  apiDocumentation: 'API docs...'
});

// Parse endpoints
const { data } = await api.endpoints.parse(
  projectId,
  apiDocumentation
);

// Generate tools
const { data: tools } = await api.tools.generate(projectId);
```

### Error Handling
```typescript
// Backend
try {
  const result = await someService.doSomething();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message 
  });
}

// Frontend
try {
  const { data } = await api.projects.create(projectData);
  router.push(`/projects/${data.id}/analysis`);
} catch (error) {
  console.error('Failed to create project:', error);
  setError('Failed to create project. Please try again.');
}
```

---

## 🧪 Testing Patterns

### Service Test
```typescript
import { projectService } from '../services/projectService';

describe('ProjectService', () => {
  test('should create project', async () => {
    const project = await projectService.createProject({
      name: 'Test Project',
      description: 'Test',
      apiDocumentation: 'API docs'
    });
    
    expect(project.id).toBeDefined();
    expect(project.name).toBe('Test Project');
  });
});
```

### API Route Test
```typescript
import request from 'supertest';
import app from '../server';

describe('POST /api/projects', () => {
  test('should create project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: 'Test Project',
        description: 'Test',
        apiDocumentation: 'API docs'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

---

## 🎯 Risk Assessment Rules

```typescript
const RISK_RULES = {
  // HTTP Method based
  GET: {
    default: 'LOW',
    sensitive: 'MEDIUM'
  },
  POST: 'HIGH',
  PUT: 'HIGH',
  PATCH: 'HIGH',
  DELETE: 'CRITICAL',
  
  // Sensitive keywords
  SENSITIVE_KEYWORDS: [
    'payroll', 'salary', 'admin', 'delete',
    'terminate', 'fire', 'confidential',
    'password', 'secret', 'token'
  ],
  
  // Approval requirements
  APPROVAL_REQUIRED: {
    LOW: false,
    MEDIUM: false,
    HIGH: true,
    CRITICAL: true
  }
};
```

---

## 📝 Template Placeholders

### MCP Server Template
```typescript
// Placeholders to replace:
{PROJECT_NAME}       // Project name
{PROJECT_VERSION}    // Version (default: 1.0.0)
{TOOL_IMPORTS}       // Import statements for tools
{TOOL_CASES}         // Switch cases for tool handlers
{TOOL_LIST}          // List of available tools
```

### Tool Template
```typescript
// Placeholders to replace:
{TOOL_NAME}          // Tool function name
{TOOL_DESCRIPTION}   // Tool description
{SCHEMA_NAME}        // Zod schema name
{SCHEMA_DEFINITION}  // Zod schema definition
{ENDPOINT_METHOD}    // HTTP method
{ENDPOINT_PATH}      // API endpoint path
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging
```typescript
// Backend
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Request:', req.method, req.path);
  console.log('Body:', req.body);
}

// Frontend
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('API Call:', endpoint, data);
}
```

### Check Data Files
```bash
# View projects
cat backend/src/data/projects.json | jq

# View endpoints
cat backend/src/data/endpoints.json | jq

# View tools
cat backend/src/data/tools.json | jq
```

### Test API Endpoints
```bash
# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test","apiDocumentation":"..."}'

# Get projects
curl http://localhost:3001/api/projects

# Parse endpoints
curl -X POST http://localhost:3001/api/projects/{id}/parse \
  -H "Content-Type: application/json" \
  -d '{"apiDocumentation":"..."}'
```

---

## 🎨 UI Component Examples

### Risk Badge
```tsx
interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
}
```

### Loading State
```tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
```

---

## 🔐 Environment Variables

### Backend (.env)
```bash
PORT=3001
NODE_ENV=development
DATA_DIR=./src/data
GENERATED_DIR=../generated
DEBUG=true
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DEBUG=true
```

---

## 📦 Package Scripts

### Backend
```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "lint": "eslint src/**/*.ts"
}
```

### Frontend
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

---

## 🎯 Demo Checklist

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Sample HR API documentation ready
- [ ] Mock data populated
- [ ] All pages accessible
- [ ] Agent playground functional
- [ ] Export generates ZIP file
- [ ] Approval workflow works

---

## 🆘 Common Issues & Solutions

### Issue: Port already in use
```bash
# Find process using port
lsof -i :3001  # or :3000

# Kill process
kill -9 <PID>
```

### Issue: TypeScript errors
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### Issue: Data file not found
```bash
# Initialize data files
mkdir -p backend/src/data
echo '{"projects":[]}' > backend/src/data/projects.json
echo '{"endpoints":[]}' > backend/src/data/endpoints.json
echo '{"tools":[]}' > backend/src/data/tools.json
echo '{"policies":[]}' > backend/src/data/policies.json
echo '{"approvals":[]}' > backend/src/data/approvals.json
```

### Issue: CORS errors
```typescript
// backend/src/server.ts
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Keep this guide handy during development for quick reference!**