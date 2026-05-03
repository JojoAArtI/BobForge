export type DemoCollectionItem = Record<string, any>;

export interface DemoDataset {
  name: string;
  description: string;
  collections: Record<string, DemoCollectionItem[]>;
}

export const ATLAS_DEMO_DATA: DemoDataset = {
  name: 'AtlasOps Demo Dataset',
  description: 'Sample data for the Atlas-style API document used in the playground demo.',
  collections: {
    users: [
      {
        id: 'usr_1001',
        name: 'Maya Chen',
        email: 'maya.chen@atlasops.example',
        role: 'admin',
        status: 'active',
        created_at: '2026-04-12T09:15:00Z',
      },
      {
        id: 'usr_1002',
        name: 'Jordan Patel',
        email: 'jordan.patel@atlasops.example',
        role: 'manager',
        status: 'active',
        created_at: '2026-04-14T13:40:00Z',
      },
      {
        id: 'usr_1003',
        name: 'Rina Gomez',
        email: 'rina.gomez@atlasops.example',
        role: 'member',
        status: 'invited',
        created_at: '2026-04-22T08:05:00Z',
      },
    ],
    organizations: [
      {
        id: 'org_2001',
        name: 'Northwind Labs',
        industry: 'software',
        plan: 'enterprise',
        status: 'active',
        owner_id: 'usr_1001',
      },
      {
        id: 'org_2002',
        name: 'Harbor Health',
        industry: 'healthcare',
        plan: 'growth',
        status: 'active',
        owner_id: 'usr_1002',
      },
    ],
    projects: [
      {
        id: 'prj_3001',
        name: 'Customer Portal Revamp',
        description: 'Modernize the customer portal UX and workflows',
        status: 'in_progress',
        priority: 'high',
        owner_id: 'usr_1001',
        organization_id: 'org_2001',
      },
      {
        id: 'prj_3002',
        name: 'Operations Dashboard',
        description: 'Build internal analytics and approvals dashboards',
        status: 'planned',
        priority: 'medium',
        owner_id: 'usr_1002',
        organization_id: 'org_2002',
      },
      {
        id: 'prj_3003',
        name: 'Billing Automation',
        description: 'Automate invoices, renewals, and payment follow-up',
        status: 'review',
        priority: 'high',
        owner_id: 'usr_1001',
        organization_id: 'org_2001',
      },
    ],
    tasks: [
      {
        id: 'tsk_4001',
        title: 'Design login flow',
        description: 'Create wireframes and review states for authentication',
        status: 'todo',
        priority: 'medium',
        assignee_id: 'usr_1002',
        project_id: 'prj_3001',
        due_date: '2026-05-10',
      },
      {
        id: 'tsk_4002',
        title: 'Add approval audit log',
        description: 'Track who approved sensitive operations',
        status: 'in_progress',
        priority: 'high',
        assignee_id: 'usr_1001',
        project_id: 'prj_3002',
        due_date: '2026-05-08',
      },
      {
        id: 'tsk_4003',
        title: 'Test invoice retry flow',
        description: 'Verify invoice retry and payment failure behavior',
        status: 'done',
        priority: 'medium',
        assignee_id: 'usr_1003',
        project_id: 'prj_3003',
        due_date: '2026-05-02',
      },
    ],
    invoices: [
      {
        id: 'inv_5001',
        number: 'INV-1042',
        amount: 12400,
        currency: 'USD',
        status: 'paid',
        due_date: '2026-04-30',
        customer_id: 'org_2001',
      },
      {
        id: 'inv_5002',
        number: 'INV-1043',
        amount: 8300,
        currency: 'USD',
        status: 'open',
        due_date: '2026-05-20',
        customer_id: 'org_2002',
      },
    ],
    notifications: [
      {
        id: 'ntf_6001',
        title: 'Task approved',
        body: 'Design login flow was approved by Maya Chen.',
        status: 'unread',
        created_at: '2026-05-03T08:10:00Z',
      },
      {
        id: 'ntf_6002',
        title: 'Invoice due soon',
        body: 'Invoice INV-1043 is due in 17 days.',
        status: 'unread',
        created_at: '2026-05-03T08:30:00Z',
      },
    ],
    webhooks: [
      {
        id: 'wh_7001',
        name: 'task-updates',
        url: 'https://example.com/webhooks/task-updates',
        events: ['task.created', 'task.updated', 'task.deleted'],
        status: 'active',
      },
      {
        id: 'wh_7002',
        name: 'billing-events',
        url: 'https://example.com/webhooks/billing-events',
        events: ['invoice.paid', 'invoice.failed'],
        status: 'active',
      },
    ],
    integrations: [
      {
        id: 'int_8001',
        provider: 'slack',
        status: 'connected',
        workspace: 'northwind',
      },
      {
        id: 'int_8002',
        provider: 'jira',
        status: 'connected',
        workspace: 'atlasops',
      },
    ],
    audit_logs: [
      {
        id: 'log_9001',
        actor: 'Maya Chen',
        action: 'project.created',
        resource_type: 'project',
        created_at: '2026-05-02T10:10:00Z',
      },
      {
        id: 'log_9002',
        actor: 'Jordan Patel',
        action: 'invoice.paid',
        resource_type: 'invoice',
        created_at: '2026-05-03T07:40:00Z',
      },
    ],
  },
};

