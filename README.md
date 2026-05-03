# 🚀 BobForge

**Transform messy API documentation into secure, tested, and agent-ready MCP servers**

Built for the **IBM Bob Dev Day Hackathon** | Powered by **watsonx.ai Granite** & **IBM Bob IDE**

---

## 🎯 What is BobForge?

BobForge is a developer tool that automates the entire pipeline of converting enterprise API documentation into production-ready MCP (Model Context Protocol) servers with built-in safety controls.

### The Problem
- Enterprise APIs are not ready for AI agents
- Documentation is messy and unstructured
- No safety controls or approval workflows
- Manual MCP server development is time-consuming
- No testing infrastructure

### The Solution
BobForge provides a **complete automated pipeline**:

```
API Docs → Endpoint Extraction → MCP Tool Plan → Risk Assessment → Code Generation → Tests → Agent Playground
```

---

## ✨ Key Features

### 🤖 AI-Powered Documentation Parsing
- Uses **watsonx.ai Granite** to understand messy API docs
- Extracts endpoints, parameters, and descriptions
- Handles various documentation formats

### 🛡️ Enterprise-Grade Safety
- **4-level risk assessment** (LOW/MEDIUM/HIGH/CRITICAL)
- **Automatic approval workflows** for high-risk operations
- **Policy-based execution** with configurable rules
- **Audit logging** for compliance

### 🔧 Complete Code Generation
- **Template-based generation** (reliable, not random)
- **Full TypeScript MCP server** with type safety
- **Zod validation schemas** for input validation
- **Comprehensive test suites** for each tool
- **Production-ready configuration** (package.json, tsconfig.json)

### 🎮 Interactive Testing
- **Agent Playground** for testing tools with natural language
- **Real-time execution** with mock API responses
- **Approval management** interface
- **Chat history** and debugging tools

### 📦 Export & Deploy
- **One-click ZIP export** of complete MCP server
- **Ready to deploy** to any Node.js environment
- **Integration guides** for Claude Desktop and other AI agents

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios

**Backend:**
- Node.js + Express
- TypeScript
- Zod (validation)
- watsonx.ai SDK
- Archiver (ZIP generation)

**AI Integration:**
- watsonx.ai Granite (API parsing)
- Model Context Protocol (MCP)

### Project Structure

```
bobforge/
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # React components
│   │   ├── lib/          # API client
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── backend/              # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── data/         # JSON storage
│   └── package.json
│
├── generated/            # Generated MCP servers
│   └── mcp-server-*/    # Individual projects
│
└── docs/                 # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- watsonx.ai API credentials (optional for mock mode)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/bobforge.git
cd bobforge
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Configure watsonx.ai (optional):**
```bash
# Create .env file in backend/
cp .env.example .env

# Edit .env with your credentials:
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_MOCK_MODE=false  # Set to true to use mock mode
```

4. **Start backend server:**
```bash
npm run dev
# Server runs on http://localhost:3001
```

5. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

6. **Start frontend:**
```bash
npm run dev
# App runs on http://localhost:3000
```

7. **Open your browser:**
```
http://localhost:3000
```

---

## 📖 Usage Guide

### 1. Create a Project

1. Click **"+ Create New Project"**
2. Enter project name and description
3. Paste your API documentation (or click "Load Sample")
4. Click **"Create Project"**

### 2. Analyze Documentation

1. Click **"Analyze Documentation →"**
2. watsonx.ai Granite parses your docs
3. View extracted endpoints with methods, paths, and parameters

### 3. Generate MCP Tools

1. Automatic after parsing
2. View generated tool names and descriptions
3. See input schemas for each tool

### 4. Review Risk Assessment

1. Automatic risk scoring for each tool
2. View risk levels (LOW/MEDIUM/HIGH/CRITICAL)
3. See which tools require approval
4. Review risk policy summary

### 5. Generate Code

1. Click **"Generate Code →"**
2. Complete MCP server is generated
3. View all generated files in the preview

### 6. Test in Playground

1. Click **"Open Playground →"**
2. Ask natural language questions:
   - "Check leave balance for employee E101"
   - "Create a leave request for employee E102"
3. See tool selection and execution
4. Approve high-risk operations

### 7. Export & Deploy

1. Click **"Download ZIP →"**
2. Extract the ZIP file
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Run: `npm start`

---

## 🎮 Agent Playground

The playground lets you test your MCP tools with natural language queries.

### Example Queries

**Low/Medium Risk (Execute Immediately):**
```
"Check leave balance for employee E101"
"Get payroll information for employee E102"
"What is the status of employee E103?"
```

**High Risk (Requires Approval):**
```
"Create a leave request for employee E101 from 2024-01-15 to 2024-01-20"
"Submit an HR ticket for employee E103 about benefits"
"Update payroll information for employee E102"
```

### Approval Workflow

1. High-risk query is submitted
2. System responds: "This action requires approval"
3. Go to **Approvals** tab
4. Review the request details
5. Click **Approve** or **Reject**
6. If approved, tool executes automatically

---

## 🛡️ Risk Assessment

BobForge automatically assesses risk for each tool:

| Risk Level | Description | Approval Required | Examples |
|------------|-------------|-------------------|----------|
| **LOW** | Safe read operations | No | GET /public-data |
| **MEDIUM** | Internal data reads | No | GET /employees/{id} |
| **HIGH** | Write operations | Yes | POST /leave-request |
| **CRITICAL** | Destructive operations | Yes | DELETE /employee/{id} |

### Risk Rules

- **GET requests** → LOW or MEDIUM
- **POST/PUT/PATCH** → HIGH
- **DELETE** → CRITICAL
- **Sensitive data** → Increases risk level
- **Financial operations** → CRITICAL

---

## 🔌 Integration with AI Agents

### Claude Desktop

1. Build your MCP server:
```bash
cd generated/mcp-server-your-project
npm run build
```

2. Configure Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "your-project": {
      "command": "node",
      "args": ["/path/to/generated/mcp-server-your-project/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

4. Claude can now use your tools!

### Other MCP-Compatible Agents

Any AI agent that supports the Model Context Protocol can use your generated MCP server.

---

## 📊 Demo Use Case: HR System

BobForge includes a sample HR system API with:

- **Employee leave balance** (GET)
- **Leave request submission** (POST)
- **Payroll information** (GET)
- **HR ticket creation** (POST)

This demonstrates:
- ✅ Read operations (LOW/MEDIUM risk)
- ✅ Write operations (HIGH risk)
- ✅ Approval workflows
- ✅ Complete end-to-end flow

---

## 🎯 Hackathon Highlights

### IBM Bob IDE Integration
- Developed entirely in IBM Bob IDE
- Leverages Bob's AI-powered development features
- Demonstrates modern development workflow

### watsonx.ai Granite Usage
- API documentation parsing
- Natural language understanding
- Endpoint extraction and classification
- Tool description generation

### Enterprise-Ready Features
- Production-grade code generation
- Comprehensive error handling
- Type safety throughout
- Security and compliance controls
- Audit logging

---

## 🏆 Why BobForge?

### For Developers
- **Save hours** of manual MCP server development
- **Reduce errors** with template-based generation
- **Test easily** with built-in playground
- **Deploy confidently** with comprehensive tests

### For Enterprises
- **Safety first** with risk assessment and approvals
- **Compliance ready** with audit logging
- **Scalable** architecture for multiple APIs
- **Maintainable** with clean, documented code

### For AI Agents
- **Standardized** MCP protocol
- **Validated** inputs with Zod schemas
- **Reliable** execution with error handling
- **Secure** with policy-based controls

---

## 📈 Statistics

- **9,000+** lines of code
- **50+** files
- **8** services
- **20+** API endpoints
- **8** frontend pages
- **4** risk levels
- **100%** TypeScript

---

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 📝 Documentation

- **[Technical Specification](TECHNICAL_SPEC.md)** - Detailed architecture
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Development guide
- **[Workflow Guide](WORKFLOW.md)** - User workflow
- **[Quick Reference](QUICK_REFERENCE.md)** - API reference
- **[watsonx.ai Setup](WATSONX_SETUP.md)** - AI integration guide

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **IBM Bob Dev Day Hackathon** - For the opportunity
- **watsonx.ai Granite** - For AI-powered parsing
- **Model Context Protocol** - For the standard
- **IBM Bob IDE** - For the development environment

---

## 📧 Contact

- **GitHub**: [yourusername/bobforge](https://github.com/yourusername/bobforge)
- **Email**: your.email@example.com
- **Demo**: [Live Demo Link]

---

## 🎬 Demo Video

[Link to demo video showing complete workflow]

---

**Built with ❤️ for the IBM Bob Dev Day Hackathon**

**Made with Bob** 🤖