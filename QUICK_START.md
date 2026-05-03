# 🚀 BobForge Quick Start Guide

**Get BobForge running in 5 minutes!**

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ **Node.js 18 or higher** installed ([Download here](https://nodejs.org/))
- ✅ **npm** (comes with Node.js)
- ✅ A terminal/command prompt
- ✅ A code editor (VS Code recommended)

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies

Open your terminal and run:

```bash
cd backend
npm install
```

**What this does**: Installs all the backend packages (Express, TypeScript, etc.)

**Wait time**: ~1-2 minutes

---

### Step 2: Install Frontend Dependencies

In a new terminal window:

```bash
cd frontend
npm install
```

**What this does**: Installs all the frontend packages (Next.js, React, Tailwind CSS)

**Wait time**: ~1-2 minutes

---

### Step 3: Start the Backend Server

In the first terminal (backend folder):

```bash
npm run dev
```

**You should see**:
```
🔨 BobForge Backend Server
📡 Server running on port 3001
🌐 API: http://localhost:3001/api
```

**Keep this terminal running!**

---

### Step 4: Start the Frontend Server

In the second terminal (frontend folder):

```bash
npm run dev
```

**You should see**:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
✓ Ready in 2.5s
```

**Keep this terminal running too!**

---

### Step 5: Open the Application

Open your web browser and go to:

```
http://localhost:3000
```

**You should see the BobForge landing page!** 🎉

---

## 🎮 How to Use BobForge

### Complete Workflow (5 minutes)

#### 1️⃣ **Create a New Project**

1. Click the **"+ Create New Project"** button
2. Fill in the form:
   - **Project Name**: `HR System MCP`
   - **Description**: `Convert HR APIs to MCP tools`
3. Click **"Load Sample HR API"** button (loads example data)
4. Click **"Create Project"**

**What happens**: Creates a new project and redirects to analysis page

---

#### 2️⃣ **Analyze API Documentation**

You're now on the **Analysis** page.

1. Review the parsed endpoints (4 endpoints should be shown)
2. Check the parameters and descriptions
3. Click **"Continue to Tool Planning →"**

**What happens**: watsonx.ai Granite (or mock parser) extracts API endpoints from the documentation

**You'll see**:
- `GET /employees/{id}/leave-balance`
- `POST /employees/{id}/leave-request`
- `GET /employees/{id}/payroll`
- `POST /hr/tickets`

---

#### 3️⃣ **Review MCP Tool Plan**

You're now on the **Tool Plan** page.

1. Review the generated MCP tools (4 tools)
2. Check tool names and descriptions
3. Review input schemas
4. Click **"Continue to Risk Assessment →"**

**What happens**: System converts API endpoints into MCP tool definitions

**You'll see tools like**:
- `check_leave_balance`
- `submit_leave_request`
- `check_payroll_status`
- `create_hr_ticket`

---

#### 4️⃣ **Review Risk Assessment**

You're now on the **Risk Assessment** page.

1. Review risk levels for each tool
2. Notice which tools require approval (HIGH/CRITICAL risk)
3. Read the risk policy summary
4. Click **"Continue to Code Preview →"**

**What happens**: System assesses risk level for each tool

**Risk Levels**:
- 🟢 **LOW**: Read-only, non-sensitive (e.g., check leave balance)
- 🟡 **MEDIUM**: Read with sensitive data
- 🟠 **HIGH**: Write operations (e.g., submit leave request) - **Requires Approval**
- 🔴 **CRITICAL**: Delete/admin operations - **Requires Approval**

---

#### 5️⃣ **Preview Generated Code**

You're now on the **Code Preview** page.

1. Browse through the generated files:
   - `server.ts` - Main MCP server
   - `tools/` - Individual tool implementations
   - `schemas.ts` - Zod validation schemas
   - `tests/` - Test files
   - `README.md` - Documentation
   - `package.json` - Dependencies
2. Click **"Continue to Playground →"**

**What happens**: System generates complete MCP server code with TypeScript, tests, and documentation

---

#### 6️⃣ **Test in Agent Playground**

You're now on the **Agent Playground** page.

**Try these queries**:

**Query 1** (Safe - executes immediately):
```
How many leaves does employee E102 have?
```

**What happens**:
- ✅ Tool selected: `check_leave_balance`
- ✅ Risk level: LOW
- ✅ Executes immediately
- ✅ Shows result: "Employee E102 has 12 leave days remaining"

**Query 2** (Risky - requires approval):
```
Submit leave request for employee E101 from May 10 to May 12
```

**What happens**:
- ⚠️ Tool selected: `submit_leave_request`
- ⚠️ Risk level: HIGH
- ⚠️ **Approval Required** (because it modifies HR records)
- ⚠️ Shows approval request with **Approve/Reject** buttons

**Try approving**:
1. Click **"Approve"** button
2. Tool executes
3. Shows success message

**This demonstrates the safety controls!**

---

#### 7️⃣ **Export the MCP Server**

1. Click **"Continue to Export →"**
2. You're now on the **Export** page
3. Click **"Download MCP Server Package"**
4. A ZIP file downloads with the complete MCP server

**What's in the ZIP**:
- Complete TypeScript MCP server
- All tool implementations
- Test files
- Documentation
- package.json with dependencies
- Ready to deploy!

---

## 🎯 Key Features to Try

### 1. **watsonx.ai Granite Integration**

The app uses IBM watsonx.ai Granite for:
- **Intelligent API parsing** (Step 2)
- **Natural language queries** (Step 6)

**To use real Granite** (optional):
1. Edit `backend/.env`
2. Set `WATSONX_MOCK_MODE=false`
3. Restart backend server

**To use mock mode** (default):
- Already configured
- Works without watsonx.ai credentials
- Uses pattern matching instead of AI

### 2. **Risk Assessment**

Every tool gets a risk level:
- **LOW**: Safe, executes immediately
- **MEDIUM**: Sensitive data, may need review
- **HIGH**: Modifies data, requires approval
- **CRITICAL**: Dangerous operations, requires approval

### 3. **Approval Workflow**

High-risk operations require human approval:
1. Agent requests action
2. System creates approval request
3. Human reviews and approves/rejects
4. Only then does the action execute

**This is the key safety feature!**

### 4. **Agent Playground**

Test your MCP tools with natural language:
- Type queries in plain English
- System selects the right tool
- Extracts parameters automatically
- Shows execution trace
- Handles approvals

---

## 🔧 Configuration Options

### Backend Configuration (`backend/.env`)

Already configured with your credentials:

```env
# Server
PORT=3001
NODE_ENV=development

# watsonx.ai
WATSONX_API_KEY=<your_watsonx_api_key>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=<your_watsonx_project_id>
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
WATSONX_MAX_TOKENS=2000
WATSONX_TEMPERATURE=0.7

# Mock Mode (true = use mock data, false = use real Granite)
WATSONX_MOCK_MODE=false

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration (`frontend/.env`)

Already configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### Problem: "Port 3001 already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Problem: "Port 3000 already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Problem: "Module not found"

**Solution**:
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

### Problem: "Cannot connect to backend"

**Check**:
1. Backend server is running (Terminal 1)
2. Shows "Server running on port 3001"
3. Frontend `.env` has correct URL: `http://localhost:3001`

### Problem: "watsonx.ai API error"

**Solution**:
1. Set `WATSONX_MOCK_MODE=true` in `backend/.env`
2. Restart backend server
3. App will use mock data instead

---

## 📚 Additional Resources

### Documentation
- **README.md** - Project overview
- **SETUP_GUIDE.md** - Detailed setup
- **TECHNICAL_SPEC.md** - Technical details
- **WATSONX_SETUP.md** - Granite integration
- **HACKATHON_SUBMISSION.md** - Complete submission guide

### IBM Bob Session Reports
- **bob_sessions/README.md** - Overview
- **task-1-project-planning.md** - Architecture
- **task-2-backend-implementation.md** - Backend
- **task-3-watsonx-integration.md** - AI integration
- **task-4-frontend-development.md** - Frontend
- **task-5-testing-and-polish.md** - Testing

### Built with Bob Page
Visit `http://localhost:3000/bob` to see:
- How IBM Bob IDE was used
- Development timeline
- Impact metrics
- Session reports

---

## 🎉 You're Ready!

You now know how to:
- ✅ Run BobForge
- ✅ Create projects
- ✅ Analyze API documentation
- ✅ Generate MCP tools
- ✅ Review risk assessments
- ✅ Test in the playground
- ✅ Export MCP servers

**Enjoy using BobForge!** 🚀

---

## 💡 Quick Tips

1. **Use Sample Data**: Click "Load Sample HR API" for quick testing
2. **Try Different Queries**: Test various natural language queries in the playground
3. **Check Risk Levels**: Notice how different operations have different risk levels
4. **Test Approvals**: Try queries that require approval to see the workflow
5. **Export and Inspect**: Download the ZIP to see the generated code
6. **Visit /bob Page**: See how IBM Bob IDE helped build this project

---

## 🆘 Need Help?

- Check **SETUP_GUIDE.md** for detailed instructions
- Review **TECHNICAL_SPEC.md** for architecture details
- Read **bob_sessions/** for development insights
- Check the troubleshooting section above

**Happy building with BobForge!** 🎯
