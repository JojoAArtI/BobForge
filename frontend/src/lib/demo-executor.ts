import { AgentResponse } from '@/types';
import { DemoDataset } from './demo-data';

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function extractId(query: string, prefixes: string[]) {
  const lowered = query.toLowerCase();
  const patterns = prefixes.map((prefix) => new RegExp(`${prefix}_[a-z0-9]+`, 'i'));
  for (const pattern of patterns) {
    const match = lowered.match(pattern);
    if (match) return match[0];
  }
  return '';
}

function collectionName(query: string): string {
  const lower = normalize(query);
  if (lower.includes('invoice') || lower.includes('billing') || lower.includes('payment')) return 'invoices';
  if (lower.includes('webhook')) return 'webhooks';
  if (lower.includes('integration')) return 'integrations';
  if (lower.includes('notification')) return 'notifications';
  if (lower.includes('organization') || lower.includes('org')) return 'organizations';
  if (lower.includes('project')) return 'projects';
  if (lower.includes('task') || lower.includes('todo')) return 'tasks';
  return 'users';
}

function actionVerb(query: string): 'list' | 'get' | 'create' | 'update' | 'delete' {
  const lower = normalize(query);
  if (lower.includes('create') || lower.includes('add') || lower.includes('new')) return 'create';
  if (lower.includes('update') || lower.includes('edit') || lower.includes('change')) return 'update';
  if (lower.includes('delete') || lower.includes('remove')) return 'delete';
  if (lower.includes('show') || lower.includes('find') || lower.includes('get') || lower.includes('details')) return 'get';
  return 'list';
}

function titleFromQuery(query: string, fallback: string) {
  const match = query.match(/(?:create|add|new)\s+(?:a|an|the)?\s*(.+)$/i);
  return match ? match[1].trim().replace(/[?.!]+$/, '') : fallback;
}

export function runDemoQuery(query: string, dataset: DemoDataset): AgentResponse {
  const collection = collectionName(query);
  const verb = actionVerb(query);
  const items = dataset.collections[collection] || [];
  const id = extractId(query, ['usr', 'org', 'prj', 'tsk', 'inv', 'ntf', 'wh', 'int', 'log']);

  let result: any;
  let toolUsed = `demo:${verb}_${collection}`;

  if (verb === 'create') {
    const created = {
      id: `${collection.slice(0, 3)}_${Date.now().toString().slice(-6)}`,
      name: titleFromQuery(query, `New ${collection.slice(0, -1)}`),
      status: 'draft',
      created_at: new Date().toISOString(),
    };

    dataset.collections[collection] = [created, ...items];
    result = { created };
    toolUsed = `demo:create_${collection}`;
  } else if (verb === 'update' && id) {
    const existing = items.find((item) => Object.values(item).some((value) => String(value).toLowerCase() === id));
    const updated = existing ? { ...existing, updated_at: new Date().toISOString(), status: 'updated' } : null;
    result = updated ? { updated } : { message: `No ${collection} record matched ${id}` };
    toolUsed = `demo:update_${collection}`;
  } else if (verb === 'delete' && id) {
    const before = items.length;
    dataset.collections[collection] = items.filter((item) => !Object.values(item).some((value) => String(value).toLowerCase() === id));
    result = { deleted: before !== dataset.collections[collection].length, id };
    toolUsed = `demo:delete_${collection}`;
  } else if (id) {
    const record = items.find((item) => Object.values(item).some((value) => String(value).toLowerCase() === id));
    result = record ? { [collection.slice(0, -1)]: record } : { message: `No ${collection} record matched ${id}` };
    toolUsed = `demo:get_${collection}`;
  } else {
    result = {
      collection,
      count: items.length,
      items: items.slice(0, 5),
    };
    toolUsed = `demo:list_${collection}`;
  }

  return {
    message: `Demo mode ran locally against ${dataset.name}.`,
    toolUsed,
    toolDescription: `Local demo executor for the ${collection} collection`,
    parameters: {
      query,
      collection,
      mode: verb,
    },
    result,
    approvalRequired: false,
    riskLevel: 'LOW',
    timestamp: new Date().toISOString(),
  };
}

