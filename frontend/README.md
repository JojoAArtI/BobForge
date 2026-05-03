# BobForge Frontend

Next.js frontend for BobForge - Convert API documentation into secure, tested, and agent-ready MCP tools.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   └── create/             # Create project page
│   ├── components/             # Reusable components
│   ├── lib/                    # Utilities
│   │   └── api.ts              # API client
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## 🎨 Pages

### 1. Landing Page (`/`)
- Project overview
- List of existing projects
- Quick access to create new project

### 2. Create Project (`/create`)
- Project name and description
- API documentation input
- Parse and analyze

### 3. API Analysis (`/projects/[id]/analysis`)
- View parsed endpoints
- Endpoint details
- Generate tools button

### 4. MCP Tool Plan (`/projects/[id]/plan`)
- Generated MCP tools
- Tool schemas
- Assess risk button

### 5. Risk Review (`/projects/[id]/risk`)
- Risk levels for each tool
- Approval requirements
- Policy summary
- Generate code button

### 6. Code Preview (`/projects/[id]/preview`)
- Generated file structure
- Code viewer
- Test in playground button

### 7. Agent Playground (`/projects/[id]/playground`)
- Chat interface
- Tool execution
- Approval workflow
- Execution logs

### 8. Export (`/projects/[id]/export`)
- Download ZIP
- Installation instructions
- Deployment guide

## 🎨 Styling

### Tailwind CSS

Custom theme with IBM-inspired colors:

```javascript
colors: {
  primary: '#0f62fe',    // IBM Blue
  secondary: '#393939',  // Dark Gray
  success: '#24a148',    // Green
  warning: '#f1c21b',    // Yellow
  danger: '#da1e28',     // Red
}
```

### Custom Components

Pre-built utility classes:
- `.btn` - Button base
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card container
- `.input` - Form input
- `.badge` - Status badge
- `.badge-low/medium/high/critical` - Risk badges

## 📡 API Integration

### API Client

Located in `src/lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// Create project
const response = await api.projects.create({
  name: 'My Project',
  description: 'Description',
  apiDocumentation: 'API docs...'
});

// Parse endpoints
await api.endpoints.parse(projectId);

// Generate tools
await api.tools.generate(projectId);
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🔄 Page Flow

```
Landing (/)
  ↓
Create (/create)
  ↓
Analysis (/projects/[id]/analysis)
  ↓
Plan (/projects/[id]/plan)
  ↓
Risk (/projects/[id]/risk)
  ↓
Preview (/projects/[id]/preview)
  ↓
Playground (/projects/[id]/playground)
  ↓
Export (/projects/[id]/export)
```

## 🧩 Components

### Planned Components

- `Header.tsx` - Navigation header
- `ProjectCard.tsx` - Project list item
- `EndpointList.tsx` - Endpoint display
- `ToolCard.tsx` - MCP tool card
- `RiskBadge.tsx` - Risk level indicator
- `CodePreview.tsx` - Code viewer
- `ChatInterface.tsx` - Agent chat
- `ApprovalPanel.tsx` - Approval UI

## 🔧 Development

```bash
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

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Tailwind responsive utilities

## 🎯 Features

### Implemented
- ✅ Landing page with project list
- ✅ Responsive design
- ✅ API client integration
- ✅ TypeScript types
- ✅ Tailwind CSS setup

### To Implement
- [ ] Create project page
- [ ] Analysis page
- [ ] Tool plan page
- [ ] Risk review page
- [ ] Code preview page
- [ ] Agent playground
- [ ] Export page
- [ ] Reusable components

## 🚨 Error Handling

All API calls include error handling:

```typescript
try {
  const response = await api.projects.create(data);
  // Handle success
} catch (error) {
  console.error('Failed:', error);
  // Show error message to user
}
```

## 🎨 UI/UX Guidelines

### Colors
- Primary actions: Blue (#0f62fe)
- Success states: Green (#24a148)
- Warnings: Yellow (#f1c21b)
- Errors: Red (#da1e28)

### Typography
- Headings: Bold, clear hierarchy
- Body: Inter font, 16px base
- Code: IBM Plex Mono

### Spacing
- Consistent padding: 4, 6, 8, 12, 16, 24px
- Card spacing: 24px (p-6)
- Section spacing: 48px (py-12)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Contributing

This is a hackathon project. See main README for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for IBM Bob Dev Day Hackathon**