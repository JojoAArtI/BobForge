# BobForge Setup Guide

Complete setup instructions for the BobForge hackathon project.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18 or higher
- ✅ npm or yarn package manager
- ✅ Git (for version control)
- ✅ IBM Bob IDE (recommended)
- ✅ A code editor (VS Code, etc.)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express, cors (API server)
- zod (validation)
- uuid (ID generation)
- archiver, fs-extra (file operations)
- TypeScript and development tools

### Step 2: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- react, react-dom, next (frontend framework)
- axios (HTTP client)
- tailwindcss (styling)
- TypeScript and development tools

### Step 3: Set Up Environment Variables

**Backend:**
```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env` with your watsonx.ai credentials:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# watsonx.ai Configuration
WATSONX_API_KEY=<your_watsonx_api_key>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=<your_watsonx_project_id>

# Model Configuration
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
WATSONX_MAX_TOKENS=2000
WATSONX_TEMPERATURE=0.7

# Mock Mode (set to false to use real watsonx.ai)
WATSONX_MOCK_MODE=true

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:3000
```

**Important:**
- Get your watsonx.ai credentials from [IBM Cloud](https://cloud.ibm.com/)
- Set `WATSONX_MOCK_MODE=false` when you have valid credentials
- Keep `WATSONX_MOCK_MODE=true` to use mock data for testing

**Frontend:**
```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `.env.local` if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 4: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🔨 BobForge Backend Server
📡 Server running on port 3001
🌐 API: http://localhost:3001/api
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
```

### Step 5: Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the BobForge landing page! 🎉

## 📁 Project Structure Overview

```
bobforge/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── services/          # 8 business logic services
│   │   ├── routes/            # API endpoints
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   ├── data/              # JSON storage (5 files)
│   │   └── server.ts          # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   ├── components/        # React components
│   │   ├── lib/               # API client
│   │   └── types/             # TypeScript definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.local
├── generated/                  # MCP server output
├── README.md
├── TECHNICAL_SPEC.md
├── IMPLEMENTATION_GUIDE.md
└── SETUP_GUIDE.md (this file)
```

## 🧪 Testing the Application

### 1. Create a Test Project

1. Click "Create New Project" on the landing page
2. Enter:
   - **Name**: HR System API
   - **Description**: Employee management endpoints
   - **API Documentation**: Paste the sample below

**Sample HR API Documentation:**
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

3. Click "Analyze" to parse the documentation

### 2. Test the Complete Workflow

Follow the workflow:
1. **Analysis** - View parsed endpoints
2. **Generate Tools** - Create MCP tools
3. **Assess Risk** - Review risk levels
4. **Generate Code** - Create MCP server
5. **Playground** - Test with queries
6. **Export** - Download ZIP

### 3. Test the Mock HR API

The backend includes a mock HR API for testing:

```bash
# Get employee leave balance
curl http://localhost:3001/api/mock/hr/employees/E101/leave-balance

# List all employees
curl http://localhost:3001/api/mock/hr/employees

# Get employee details
curl http://localhost:3001/api/mock/hr/employees/E102
```

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Start with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests (when implemented)
npm test
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check
```

## 📊 Verify Installation

### Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-03T...",
  "service": "BobForge Backend",
  "version": "1.0.0"
}
```

### Check Frontend

Navigate to `http://localhost:3000` and verify:
- ✅ Landing page loads
- ✅ "Create New Project" button visible
- ✅ No console errors
- ✅ Tailwind CSS styles applied

### Check API Connection

On the landing page, the project list should load (empty initially).
Check browser console for:
```
API Request: GET /projects
```

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `Port 3001 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

Or change the port in `.env`:
```
PORT=3002
```

### TypeScript Errors

**Error**: `Cannot find module 'express'`

**Solution**: Install dependencies
```bash
cd backend
npm install
```

### CORS Errors

**Error**: `Access-Control-Allow-Origin`

**Solution**: Check backend CORS configuration in `server.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

### Frontend Not Loading

**Error**: Blank page or build errors

**Solution**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

The compiled JavaScript will be in `backend/dist/`

### Frontend

```bash
cd frontend
npm run build
npm start
```

The optimized build will be in `frontend/.next/`

## 🚢 Deployment Options

### Option 1: Local Development
- Backend: `npm run dev` (port 3001)
- Frontend: `npm run dev` (port 3000)

### Option 2: Production Build
- Backend: `npm run build && npm start`
- Frontend: `npm run build && npm start`

### Option 3: Docker (Future)
```dockerfile
# Dockerfile for backend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🎯 Demo Preparation

### Before the Demo

1. ✅ Both servers running
2. ✅ Sample HR API documentation ready
3. ✅ Test the complete workflow once
4. ✅ Clear browser cache
5. ✅ Close unnecessary tabs
6. ✅ Prepare talking points

### Demo Script (5 minutes)

**Minute 1**: Introduction
- Show landing page
- Explain the problem (messy API docs → agent-ready tools)

**Minute 2**: Create Project
- Click "Create New Project"
- Paste HR API documentation
- Click "Analyze"

**Minute 3**: Show Pipeline
- View parsed endpoints
- Generate MCP tools
- Show risk assessment

**Minute 4**: Agent Playground
- Ask: "How many leaves does employee E102 have?"
- Show LOW risk execution
- Ask: "Submit leave request for E101"
- Show HIGH risk approval requirement

**Minute 5**: Export & Conclusion
- Show generated code
- Download ZIP
- Highlight key features

## 📚 Additional Resources

### Documentation
- [README.md](./README.md) - Project overview
- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - Technical details
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation details
- [WORKFLOW.md](./WORKFLOW.md) - Visual workflows
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference

### Backend
- [backend/README.md](./backend/README.md) - Backend documentation

### Frontend
- [frontend/README.md](./frontend/README.md) - Frontend documentation

## 🤝 Getting Help

### Common Issues

1. **Dependencies not installing**: Clear npm cache
   ```bash
   npm cache clean --force
   npm install
   ```

2. **TypeScript errors**: Ensure Node.js 18+
   ```bash
   node --version
   ```

3. **API not responding**: Check backend logs
   ```bash
   cd backend
   npm run dev
   ```

### Debug Mode

Enable verbose logging:

**Backend** (.env):
```
DEBUG=true
```

**Frontend** (.env.local):
```
NEXT_PUBLIC_DEBUG=true
```

## ✅ Setup Checklist

Before starting development:

- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Backend server running (port 3001)
- [ ] Frontend server running (port 3000)
- [ ] Landing page loads successfully
- [ ] API health check passes
- [ ] Sample project creation works
- [ ] Mock HR API responds

## 🎉 You're Ready!

If all checks pass, you're ready to:
- ✅ Develop new features
- ✅ Test the application
- ✅ Prepare for the demo
- ✅ Present at the hackathon

**Good luck with the IBM Bob Dev Day Hackathon! 🚀**

---

**Questions?** Check the documentation or review the code comments.
