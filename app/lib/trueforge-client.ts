import 'server-only';

const DEFAULT_BASE_URL = 'http://localhost:8790';
const DEFAULT_MODEL = 'google-gemini/gemini-3-6-flash';
type JsonRecord = Record<string, unknown>;

export interface TrueForgeRunMetadata {
  sessionId: string;
  turnId: string;
  model: string;
  status: string;
  durationMs: number;
}

export interface TrueForgeRunResult {
  content: string;
  metadata: TrueForgeRunMetadata;
}

export class TrueForgeError extends Error {
  readonly code: 'network_error' | 'http_error' | 'invalid_response' | 'turn_failed' | 'timeout';
  readonly metadata?: Partial<TrueForgeRunMetadata>;

  constructor(
    message: string,
    code: 'network_error' | 'http_error' | 'invalid_response' | 'turn_failed' | 'timeout',
    metadata?: Partial<TrueForgeRunMetadata>
  ) {
    super(message);
    this.name = 'TrueForgeError';
    this.code = code;
    this.metadata = metadata;
  }
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : undefined;
}

function stringAt(value: unknown, keys: string[]): string | undefined {
  let current: unknown = value;
  for (const key of keys) current = asRecord(current)?.[key];
  return typeof current === 'string' && current.trim() ? current.trim() : undefined;
}

function getId(value: unknown, names: string[]): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  for (const name of names) {
    if (typeof record[name] === 'string' && record[name]) return record[name] as string;
  }
  for (const key of ['session', 'turn', 'data']) {
    const nested = getId(record[key], names);
    if (nested) return nested;
  }
}

function getStatus(value: unknown): string {
  return (stringAt(value, ['state', 'status']) || stringAt(value, ['status']) ||
    stringAt(value, ['turn', 'state', 'status']) || stringAt(value, ['data', 'state', 'status']) ||
    'unknown').toLowerCase();
}

function findTurnById(value: unknown, turnId: string): unknown {
  if (Array.isArray(value)) {
    return value.find(item => {
      const record = asRecord(item);
      return record && ['turn_id', 'turnId', 'id'].some(key => record[key] === turnId);
    });
  }
  const record = asRecord(value);
  if (!record) return undefined;
  if (['turn_id', 'turnId', 'id'].some(key => record[key] === turnId)) return record;
  for (const key of ['turns', 'items', 'data']) {
    const turn = findTurnById(record[key], turnId);
    if (turn) return turn;
  }
}

function extractText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const parts = value.map(extractText).filter((part): part is string => Boolean(part));
    return parts.length ? parts.join('\n') : undefined;
  }
  const record = asRecord(value);
  if (!record) return undefined;
  for (const key of ['text', 'content', 'output_text', 'message']) {
    const text = extractText(record[key]);
    if (text) return text;
  }
}

function isAssistantItem(value: unknown): boolean {
  const record = asRecord(value);
  const type = typeof record?.type === 'string' ? record.type.toLowerCase() : '';
  const role = typeof record?.role === 'string' ? record.role.toLowerCase() : '';
  return role === 'assistant' || type.includes('assistant') ||
    type.includes('agent.message') || type.includes('model.message');
}

function extractClarificationRequest(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const item of [...value].reverse()) {
      const question = extractClarificationRequest(item);
      if (question) return question;
    }
    return undefined;
  }
  const record = asRecord(value);
  if (!record) return undefined;
  if (Array.isArray(record.tool_calls)) {
    for (const call of record.tool_calls) {
      const fn = asRecord(asRecord(call)?.function);
      if (fn?.name !== 'ask_user_question' || typeof fn.arguments !== 'string') continue;
      try {
        const args = asRecord(JSON.parse(fn.arguments));
        if (typeof args?.question === 'string' && args.question.trim()) return args.question.trim();
      } catch {
        // Ignore malformed tool arguments; arbitrary tool calls are never executed here.
      }
    }
  }
  for (const key of ['events', 'items', 'messages', 'data']) {
    const question = extractClarificationRequest(record[key]);
    if (question) return question;
  }
}

function extractAssistantContent(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const assistant = [...value].reverse().find(isAssistantItem);
    const text = assistant ? extractText(assistant) : undefined;
    if (text) return text;
    const question = extractClarificationRequest(value);
    if (question) return question;
    for (const item of [...value].reverse()) {
      const nested = extractAssistantContent(item);
      if (nested) return nested;
    }
    return undefined;
  }
  const record = asRecord(value);
  if (!record) return undefined;
  for (const key of ['output', 'outputs', 'result', 'response']) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      const assistant = [...candidate].reverse().find(isAssistantItem);
      const text = assistant ? extractText(assistant) : extractText(candidate);
      if (text) return text;
    } else {
      const text = extractText(candidate);
      if (text) return text;
    }
  }
  for (const key of ['events', 'items', 'messages']) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      const assistant = [...candidate].reverse().find(isAssistantItem);
      if (assistant) {
        const text = extractText(assistant);
        if (text) return text;
      }
      const question = extractClarificationRequest(candidate);
      if (question) return question;
    }
  }
  // TrueForge's turn-list response stores the completed assistant message at
  // state.output.content. Recurse through response envelopes before looking for
  // output fields so those nested, runtime-observed shapes are handled too.
  for (const key of ['state', 'turn', 'data']) {
    const text = extractAssistantContent(record[key]);
    if (text) return text;
  }
}

function safeErrorMessage(body: unknown, status: number): string {
  const record = asRecord(body);
  const detail = record && typeof record.detail === 'string' ? record.detail : undefined;
  const message = record && typeof record.message === 'string' ? record.message : undefined;
  return (detail || message || `HTTP ${status}`).slice(0, 300);
}

export class TrueForgeClient {
  readonly baseUrl: string;
  readonly model: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly pollIntervalMs: number;

  constructor(options: { baseUrl?: string; apiKey?: string; model?: string; timeoutMs?: number; pollIntervalMs?: number } = {}) {
    this.baseUrl = (options.baseUrl || process.env.TRUEFORGE_BASE_URL || DEFAULT_BASE_URL)
      .replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    this.apiKey = options.apiKey || process.env.TRUEFORGE_API_KEY || process.env.TRUEFOUNDRY_API_KEY;
    this.model = options.model || process.env.TRUEFORGE_MODEL || DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs || Number(process.env.TRUEFORGE_TIMEOUT_MS) || 45_000;
    this.pollIntervalMs = options.pollIntervalMs || 750;
  }

  private async request(path: string, init: RequestInit = {}): Promise<unknown> {
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    if (init.body) headers.set('content-type', 'application/json');
    if (this.apiKey) headers.set('authorization', `Bearer ${this.apiKey}`);
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/v1${path}`, { ...init, headers, cache: 'no-store' });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new TrueForgeError('Unable to reach the TrueForge runtime.', 'network_error');
    }
    const text = await response.text();
    let body: unknown = {};
    if (text) {
      try { body = JSON.parse(text); }
      catch { throw new TrueForgeError('TrueForge returned a malformed response.', 'invalid_response'); }
    }
    if (!response.ok) throw new TrueForgeError(`TrueForge request failed: ${safeErrorMessage(body, response.status)}`, 'http_error');
    return body;
  }

  async runTurn(instructions: string, prompt: string): Promise<TrueForgeRunResult> {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let sessionId = '';
    let turnId = '';
    try {
      const session = await this.request('/sessions', {
        method: 'POST',
        body: JSON.stringify({ agent: { spec: { model: { name: this.model }, instructions } } }),
        signal: controller.signal,
      });
      sessionId = getId(session, ['session_id', 'sessionId', 'id']) || '';
      if (!sessionId) throw new TrueForgeError('TrueForge did not return a session ID.', 'invalid_response');
      const createdTurn = await this.request(`/sessions/${encodeURIComponent(sessionId)}/turns`, {
        method: 'POST',
        body: JSON.stringify({ input: [{ type: 'user.message', content: prompt }], stream: false }),
        signal: controller.signal,
      });
      turnId = getId(createdTurn, ['turn_id', 'turnId', 'id']) || '';
      if (!turnId) throw new TrueForgeError('TrueForge did not return a turn ID.', 'invalid_response', { sessionId });
      let turn: unknown = createdTurn;
      while (true) {
        const status = getStatus(turn);
        const metadata = { sessionId, turnId, model: this.model, status, durationMs: Date.now() - startedAt };
        if (['done', 'completed', 'complete', 'succeeded', 'success'].includes(status)) {
          let content = extractAssistantContent(turn);
          if (!content) {
            const events = await this.request(`/sessions/${encodeURIComponent(sessionId)}/turns/${encodeURIComponent(turnId)}/events`, { signal: controller.signal });
            content = extractAssistantContent(events);
          }
          if (!content) throw new TrueForgeError('TrueForge completed without an assistant response.', 'invalid_response', metadata);
          return { content, metadata };
        }
        if (['failed', 'cancelled', 'canceled', 'error'].includes(status)) {
          throw new TrueForgeError(`TrueForge turn ended with status: ${status}.`, 'turn_failed', metadata);
        }
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, this.pollIntervalMs);
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
          }, { once: true });
        });
        const turns = await this.request(`/sessions/${encodeURIComponent(sessionId)}/turns`, { signal: controller.signal });
        turn = findTurnById(turns, turnId) || turn;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TrueForgeError('TrueForge turn timed out.', 'timeout', {
          sessionId, turnId, model: this.model, status: 'timeout', durationMs: Date.now() - startedAt,
        });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

export function isTrueForgeConfigured(): boolean {
  return Boolean(process.env.TRUEFORGE_BASE_URL || process.env.TRUEFORGE_API_KEY || process.env.TRUEFOUNDRY_API_KEY);
}

export function getTrueForgeClient(): TrueForgeClient {
  return new TrueForgeClient();
}

export function parseJsonObject(content: string): JsonRecord {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced || content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1);
  try {
    const record = asRecord(JSON.parse(source.trim()));
    if (!record) throw new Error('not an object');
    return record;
  } catch {
    throw new TrueForgeError('TrueForge returned invalid structured security output.', 'invalid_response');
  }
}
