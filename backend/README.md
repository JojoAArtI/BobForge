# BobForge Backend

Backend API server for BobForge - Convert API documentation into secure, tested, and agent-ready MCP tools.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── services/          # Business logic
│   │   ├── projectService.ts
│   │   ├── parserService.ts
│   │   ├── toolPlannerService.ts
│   │   ├── riskEngineService.ts
│   │   ├── mcpGeneratorService.ts
│   │   ├── mockApiService.ts
│   │   ├── testService.ts
│   │   └── agentService.ts
│   ├── routes/            # API endpoints
│   │   └── projects.ts
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── fileUtils.ts
│   │   └── zipUtils.ts
│   ├── data/              # JSON storage
│   │   ├── projects.json
│   │   ├── endpoints.json
│   │   ├── tools.json
│   │   ├── policies.json
│   │   └── approvals.json
│   └── server.ts          # Express server
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/statistics` | Get project statistics |

### API Documentation Parsing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/parse` | Parse API documentation |
| GET | `/api/projects/:id/endpoints` | Get parsed endpoints |

### MCP Tool Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/generate-tools` | Generate MCP tools |
| GET | `/api/projects/:id/tools` | Get generated tools |

### Risk Assessment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/assess-risk` | Assess risk for tools |
| GET | `/api/projects/:id/policy` | Get risk policy |

### Code Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/generate` | Generate MCP server code |
| GET | `/api/projects/:id/preview` | Preview generated code |
| GET | `/api/projects/:id/export` | Download ZIP file |

### Agent Playground

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/agent/query` | Process agent query |
| GET | `/api/projects/:id/approvals` | List approvals |
| POST | `/api/approvals/:id/approve` | Approve request |
| POST | `/api/approvals/:id/reject` | Reject request |

### Mock HR API (Testing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mock/hr/employees` | List employees |
| GET | `/api/mock/hr/employees/:id` | Get employee |
| GET | `/api/mock/hr/employees/:id/leave-balance` | Get leave balance |
| POST | `/api/mock/hr/employees/:id/leave-request` | Submit leave request |
| GET | `/api/mock/hr/employees/:id/payroll` | Get payroll info |
| POST | `/api/mock/hr/tickets` | Create HR ticket |
| GET | `/api/mock/hr/tickets` | List tickets |
| GET | `/api/mock/hr/tickets/:id` | Get ticket |

## 🛠️ Services

### ProjectService
Manages project CRUD operations and lifecycle.

### ParserService
Extracts API endpoints from documentation using regex patterns.
**TODO**: Replace with watsonx.ai Granite integration.

### ToolPlannerService
Converts REST endpoints to MCP tool definitions with Zod schemas.

### RiskEngineService
Assesses risk levels (LOW/MEDIUM/HIGH/CRITICAL) and generates policies.

### MCPGeneratorService
Generates complete MCP server code using templates.

### MockApiService
Provides mock HR API for testing generated tools.

### TestService
Generates test cases for MCP tools.

### AgentService
Handles agent playground queries and approval workflow.

## 🔒 Risk Assessment

### Risk Levels

- **LOW**: Safe read operations
- **MEDIUM**: Sensitive data access
- **HIGH**: Data modification (requires approval)
- **CRITICAL**: Destructive operations (requires approval)

### Risk Rules

```typescript
GET + non-sensitive → LOW
GET + sensitive → MEDIUM
POST/PUT/PATCH → HIGH
DELETE → CRITICAL
```

## 📊 Data Storage

Uses JSON files for MVP:

- `projects.json` - Project metadata
- `endpoints.json` - Parsed API endpoints
- `tools.json` - Generated MCP tools
- `policies.json` - Risk policies
- `approvals.json` - Approval requests

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `WATSONX_API_KEY` - watsonx.ai API key (TODO)

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Custom error classes:
- `BobForgeError` - Base error
- `ValidationError` - Input validation errors
- `NotFoundError` - Resource not found
- `ParsingError` - API parsing errors

## 🔄 Workflow

1. **Create Project** → POST `/api/projects`
2. **Parse Documentation** → POST `/api/projects/:id/parse`
3. **Generate Tools** → POST `/api/projects/:id/generate-tools`
4. **Assess Risk** → POST `/api/projects/:id/assess-risk`
5. **Generate Code** → POST `/api/projects/:id/generate`
6. **Test in Playground** → POST `/api/projects/:id/agent/query`
7. **Export** → GET `/api/projects/:id/export`

## 🎯 Example Usage

### Create a Project

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HR System API",
    "description": "Employee management endpoints",
    "apiDocumentation": "GET /employees/{id}/leave-balance\nReturns leave balance..."
  }'
```

### Parse Documentation

```bash
curl -X POST http://localhost:3001/api/projects/{id}/parse
```

### Generate Tools

```bash
curl -X POST http://localhost:3001/api/projects/{id}/generate-tools
```

### Test in Playground

```bash
curl -X POST http://localhost:3001/api/projects/{id}/agent/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How many leaves does employee E102 have?",
    "userId": "user123"
  }'
```

## 🐛 Debugging

Enable debug logging:

```bash
DEBUG=true npm run dev
```

Check health endpoint:

```bash
curl http://localhost:3001/health
```

## 📚 Additional Resources

- [Technical Specification](../TECHNICAL_SPEC.md)
- [Implementation Guide](../IMPLEMENTATION_GUIDE.md)
- [API Documentation](../README.md)

## 🤝 Contributing

This is a hackathon project. See main README for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for IBM Bob Dev Day Hackathon**