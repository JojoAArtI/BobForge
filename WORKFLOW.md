# BobForge Workflow & Architecture

This document provides visual representations of BobForge's workflows and architecture.

---

## 🔄 Complete User Workflow

```mermaid
graph TD
    A[Start: Landing Page] --> B[Create New Project]
    B --> C[Paste API Documentation]
    C --> D[Click Analyze]
    D --> E[Parser Service Extracts Endpoints]
    E --> F[View API Analysis Page]
    F --> G[Review Extracted Endpoints]
    G --> H[Click Generate Tools]
    H --> I[Tool Planner Creates MCP Tools]
    I --> J[View MCP Tool Plan Page]
    J --> K[Review Generated Tools]
    K --> L[Click Assess Risk]
    L --> M[Risk Engine Evaluates Tools]
    M --> N[View Risk Review Page]
    N --> O[Review Risk Levels & Policies]
    O --> P[Click Generate Code]
    P --> Q[MCP Generator Creates Server]
    Q --> R[View Code Preview Page]
    R --> S[Browse Generated Files]
    S --> T[Click Test in Playground]
    T --> U[Agent Playground]
    U --> V{User Query}
    V --> W[Agent Selects Tool]
    W --> X{Risk Check}
    X -->|Low/Medium| Y[Execute Tool]
    X -->|High/Critical| Z[Request Approval]
    Z --> AA{Approval Decision}
    AA -->|Approved| Y
    AA -->|Rejected| AB[Show Rejection]
    Y --> AC[Display Result]
    AC --> AD[Continue Testing or Export]
    AD --> AE[Click Export]
    AE --> AF[Download ZIP Package]
    AF --> AG[End: Deploy MCP Server]
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend Layer (Next.js)"]
        LP[Landing Page]
        CP[Create Project]
        AP[Analysis Page]
        TP[Tool Plan Page]
        RP[Risk Review Page]
        PP[Preview Page]
        PG[Playground Page]
        EP[Export Page]
    end

    subgraph Backend["Backend Layer (Express)"]
        subgraph Services["Core Services"]
            PS[Project Service]
            PRS[Parser Service]
            TPS[Tool Planner Service]
            RES[Risk Engine Service]
            MGS[MCP Generator Service]
            MAS[Mock API Service]
            TS[Test Service]
            AS[Agent Service]
        end
        
        subgraph Routes["API Routes"]
            PR[Projects Routes]
            ER[Endpoints Routes]
            TR[Tools Routes]
            RR[Risk Routes]
            GR[Generate Routes]
            AR[Agent Routes]
            XR[Export Routes]
        end
    end

    subgraph Storage["Data Storage"]
        PJ[projects.json]
        EJ[endpoints.json]
        TJ[tools.json]
        POJ[policies.json]
        AJ[approvals.json]
    end

    subgraph Generated["Generated Output"]
        MCP[MCP Server Code]
        SCH[Schemas]
        TST[Tests]
        DOC[Documentation]
    end

    Frontend --> Routes
    Routes --> Services
    Services --> Storage
    Services --> Generated
```

---

## 🔄 Data Flow: API Documentation to MCP Server

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Parser
    participant Planner
    participant Risk
    participant Generator
    participant Storage

    User->>Frontend: Paste API Docs
    Frontend->>Backend: POST /api/projects/:id/parse
    Backend->>Parser: parseDocumentation(text)
    Note over Parser: Extract endpoints<br/>using regex patterns<br/>(TODO: watsonx.ai)
    Parser->>Storage: Save endpoints
    Parser-->>Backend: Return endpoints[]
    Backend-->>Frontend: Return endpoints[]
    Frontend-->>User: Show Analysis Page

    User->>Frontend: Click Generate Tools
    Frontend->>Backend: POST /api/projects/:id/generate-tools
    Backend->>Planner: generateTools(endpoints)
    Note over Planner: Convert to MCP tools<br/>Generate schemas<br/>Create descriptions
    Planner->>Storage: Save tools
    Planner-->>Backend: Return tools[]
    Backend-->>Frontend: Return tools[]
    Frontend-->>User: Show Tool Plan Page

    User->>Frontend: Click Assess Risk
    Frontend->>Backend: POST /api/projects/:id/assess-risk
    Backend->>Risk: assessRisk(tools)
    Note over Risk: Apply risk rules<br/>Determine approval needs<br/>Generate policy
    Risk->>Storage: Save policy
    Risk-->>Backend: Return policy
    Backend-->>Frontend: Return policy
    Frontend-->>User: Show Risk Review Page

    User->>Frontend: Click Generate Code
    Frontend->>Backend: POST /api/projects/:id/generate
    Backend->>Generator: generateServer(project, tools)
    Note over Generator: Load templates<br/>Replace placeholders<br/>Generate files
    Generator->>Storage: Save generated files
    Generator-->>Backend: Return files
    Backend-->>Frontend: Return preview
    Frontend-->>User: Show Code Preview
```

---

## 🎮 Agent Playground Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Agent
    participant Risk
    participant Approval
    participant Tool

    User->>Frontend: Enter query
    Frontend->>Agent: POST /api/projects/:id/agent/query
    Agent->>Agent: Parse query
    Agent->>Agent: Select appropriate tool
    Note over Agent: Keyword matching<br/>(TODO: AI selection)
    Agent->>Agent: Extract parameters
    Agent->>Risk: Check risk policy
    
    alt Low/Medium Risk
        Risk-->>Agent: No approval needed
        Agent->>Tool: Execute tool
        Tool-->>Agent: Return result
        Agent-->>Frontend: Return success + data
        Frontend-->>User: Display result
    else High/Critical Risk
        Risk-->>Agent: Approval required
        Agent->>Approval: Create approval request
        Approval-->>Agent: Return approval ID
        Agent-->>Frontend: Return approval needed
        Frontend-->>User: Show approval panel
        
        User->>Frontend: Approve/Reject
        Frontend->>Approval: POST /api/approvals/:id/approve
        
        alt Approved
            Approval->>Tool: Execute tool
            Tool-->>Approval: Return result
            Approval-->>Frontend: Return success + data
            Frontend-->>User: Display result
        else Rejected
            Approval-->>Frontend: Return rejection
            Frontend-->>User: Show rejection message
        end
    end
```

---

## 🛡️ Risk Assessment Logic

```mermaid
flowchart TD
    Start[Endpoint] --> Method{HTTP Method?}
    
    Method -->|GET| Sensitive{Contains sensitive<br/>keywords?}
    Method -->|POST| High[HIGH Risk]
    Method -->|PUT| High
    Method -->|PATCH| High
    Method -->|DELETE| Critical[CRITICAL Risk]
    
    Sensitive -->|Yes| Medium[MEDIUM Risk]
    Sensitive -->|No| Low[LOW Risk]
    
    Low --> NoApproval[No Approval Required]
    Medium --> NoApproval
    High --> Approval[Approval Required]
    Critical --> Approval
    
    NoApproval --> Policy[Add to Policy]
    Approval --> Policy
    
    Policy --> End[Risk Assessment Complete]
    
    style Low fill:#90EE90
    style Medium fill:#FFD700
    style High fill:#FFA500
    style Critical fill:#FF6347
```

---

## 📦 MCP Server Generation Process

```mermaid
flowchart LR
    subgraph Input
        Tools[MCP Tools]
        Policy[Risk Policy]
        Project[Project Info]
    end
    
    subgraph Templates
        ServerTpl[server.template.ts]
        ToolTpl[tool.template.ts]
        SchemaTpl[schema.template.ts]
        TestTpl[test.template.ts]
        ReadmeTpl[readme.template.md]
    end
    
    subgraph Generator["MCP Generator Service"]
        Load[Load Templates]
        Replace[Replace Placeholders]
        Validate[Validate Code]
        Structure[Create File Structure]
    end
    
    subgraph Output
        Server[index.ts]
        ToolFiles[tools/*.ts]
        Schemas[schemas/index.ts]
        Tests[tests/*.test.ts]
        Readme[README.md]
        Package[package.json]
        Config[tsconfig.json]
        PolicyFile[policy.json]
    end
    
    Input --> Generator
    Templates --> Generator
    Generator --> Output
```

---

## 🔐 Approval Workflow

```mermaid
stateDiagram-v2
    [*] --> ToolSelected: User query
    ToolSelected --> RiskCheck: Check policy
    
    RiskCheck --> Execute: Low/Medium risk
    RiskCheck --> CreateApproval: High/Critical risk
    
    CreateApproval --> Pending: Store approval request
    Pending --> Approved: User approves
    Pending --> Rejected: User rejects
    
    Approved --> Execute: Proceed with execution
    Rejected --> ShowError: Display rejection
    
    Execute --> Success: Tool executes
    Execute --> Error: Execution fails
    
    Success --> [*]
    Error --> [*]
    ShowError --> [*]
```

---

## 📊 Data Model Relationships

```mermaid
erDiagram
    PROJECT ||--o{ ENDPOINT : contains
    PROJECT ||--o{ TOOL : generates
    PROJECT ||--|| POLICY : has
    PROJECT ||--o{ APPROVAL : tracks
    
    ENDPOINT ||--|| TOOL : maps_to
    TOOL ||--|| RISK_ASSESSMENT : has
    
    PROJECT {
        string id PK
        string name
        string description
        string apiDocumentation
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    ENDPOINT {
        string id PK
        string projectId FK
        string method
        string path
        string description
        string operationType
        boolean sensitive
    }
    
    TOOL {
        string id PK
        string projectId FK
        string endpointId FK
        string name
        string description
        object inputSchema
        string riskLevel
        boolean approvalRequired
    }
    
    POLICY {
        string projectId FK
        array rules
        boolean defaultApprovalRequired
    }
    
    APPROVAL {
        string id PK
        string projectId FK
        string toolName
        object parameters
        string status
        datetime requestedAt
    }
```

---

## 🎯 Feature Implementation Priority

```mermaid
gantt
    title BobForge Implementation Timeline
    dateFormat YYYY-MM-DD
    section Foundation
    Project Structure           :done, p1, 2026-05-03, 1d
    Type Definitions           :done, p2, 2026-05-03, 1d
    
    section Backend Core
    Project Service            :active, b1, 2026-05-04, 1d
    Parser Service             :b2, after b1, 1d
    Tool Planner Service       :b3, after b2, 1d
    Risk Engine Service        :b4, after b3, 1d
    MCP Generator Service      :b5, after b4, 1d
    
    section Backend Support
    Mock API Service           :b6, after b5, 1d
    Test Service               :b7, after b6, 1d
    Agent Service              :b8, after b7, 1d
    API Routes                 :b9, after b8, 1d
    
    section Frontend
    Next.js Setup              :f1, after b9, 1d
    Core Pages                 :f2, after f1, 2d
    Tool & Risk Pages          :f3, after f2, 1d
    Generation Pages           :f4, after f3, 1d
    
    section Features
    Agent Playground           :feat1, after f4, 2d
    Approval System            :feat2, after feat1, 1d
    Export Functionality       :feat3, after feat2, 1d
    
    section Polish
    Documentation              :doc, after feat3, 1d
    Testing                    :test, after doc, 1d
    Demo Preparation           :demo, after test, 1d
```

---

## 🔍 Component Interaction Map

```mermaid
graph LR
    subgraph User Interface
        UI1[Landing Page]
        UI2[Create Project]
        UI3[Analysis View]
        UI4[Tool Plan View]
        UI5[Risk Review]
        UI6[Code Preview]
        UI7[Playground]
        UI8[Export]
    end
    
    subgraph API Layer
        API[Express Server]
    end
    
    subgraph Business Logic
        BL1[Project Manager]
        BL2[Parser]
        BL3[Tool Planner]
        BL4[Risk Assessor]
        BL5[Code Generator]
        BL6[Agent Handler]
    end
    
    subgraph Data
        D1[(Projects)]
        D2[(Endpoints)]
        D3[(Tools)]
        D4[(Policies)]
        D5[(Approvals)]
    end
    
    UI1 --> API
    UI2 --> API
    UI3 --> API
    UI4 --> API
    UI5 --> API
    UI6 --> API
    UI7 --> API
    UI8 --> API
    
    API --> BL1
    API --> BL2
    API --> BL3
    API --> BL4
    API --> BL5
    API --> BL6
    
    BL1 --> D1
    BL2 --> D2
    BL3 --> D3
    BL4 --> D4
    BL6 --> D5
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph Development
        DevBob[IBM Bob IDE]
        DevBackend[Backend Dev Server<br/>Port 3001]
        DevFrontend[Frontend Dev Server<br/>Port 3000]
    end
    
    subgraph Production
        ProdBackend[Backend Server<br/>Node.js]
        ProdFrontend[Frontend Server<br/>Next.js]
        ProdData[Data Storage<br/>JSON Files]
        ProdGenerated[Generated Files<br/>MCP Servers]
    end
    
    subgraph External
        WatsonX[watsonx.ai Granite<br/>API Parsing]
        MCPClient[MCP Client<br/>AI Agent]
    end
    
    DevBob --> DevBackend
    DevBob --> DevFrontend
    DevBackend --> DevFrontend
    
    ProdFrontend --> ProdBackend
    ProdBackend --> ProdData
    ProdBackend --> ProdGenerated
    ProdBackend -.->|Future| WatsonX
    ProdGenerated --> MCPClient
```

---

## 📝 Key Decision Points

### 1. When to Use Mock vs Real Data
- **Development**: Use mock data for all services
- **Demo**: Use mock HR data
- **Production**: Replace with real API calls

### 2. When to Request Approval
- **LOW Risk**: Execute immediately
- **MEDIUM Risk**: Execute immediately (log only)
- **HIGH Risk**: Request approval
- **CRITICAL Risk**: Request approval + additional verification

### 3. When to Generate Code
- After risk assessment is complete
- When user explicitly requests generation
- Before entering playground mode

### 4. When to Switch Modes
- **Plan Mode**: For initial setup and architecture
- **Code Mode**: For implementation
- **Ask Mode**: For questions and clarifications

---

## 🎓 Learning Path

For developers new to the project:

1. **Start Here**: Read README.md
2. **Understand Architecture**: Review TECHNICAL_SPEC.md
3. **Follow Implementation**: Use IMPLEMENTATION_GUIDE.md
4. **Visualize Flow**: Study this WORKFLOW.md
5. **Start Coding**: Begin with project structure setup

---

## 🔧 Troubleshooting Flowchart

```mermaid
flowchart TD
    Start[Issue Encountered] --> Type{Issue Type?}
    
    Type -->|API Error| API[Check Backend Logs]
    Type -->|UI Error| UI[Check Browser Console]
    Type -->|Build Error| Build[Check TypeScript Errors]
    Type -->|Data Error| Data[Check JSON Files]
    
    API --> APIFix{Fixed?}
    UI --> UIFix{Fixed?}
    Build --> BuildFix{Fixed?}
    Data --> DataFix{Fixed?}
    
    APIFix -->|No| APIDoc[Check API Documentation]
    UIFix -->|No| UIDoc[Check Component Code]
    BuildFix -->|No| BuildDoc[Check tsconfig.json]
    DataFix -->|No| DataDoc[Reset Data Files]
    
    APIFix -->|Yes| End[Issue Resolved]
    UIFix -->|Yes| End
    BuildFix -->|Yes| End
    DataFix -->|Yes| End
    
    APIDoc --> End
    UIDoc --> End
    BuildDoc --> End
    DataDoc --> End
```

---

**This workflow document provides visual guides for understanding BobForge's architecture and processes. Refer to it during development and when explaining the system to others.**