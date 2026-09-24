// User roles
export type UserRole = 'owner' | 'admin' | 'user' | 'analyst' | 'reviewer' | 'viewer';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  avatarInitials: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  username?: string | null;
  bio?: string | null;
  dob?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  xTwitter?: string | null;
  location?: string | null;
  socialLinks?: string | null;
  isOnboarded?: boolean;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export type UserProfileDto = Pick<
  User,
  | 'name'
  | 'username'
  | 'bio'
  | 'dob'
  | 'avatarUrl'
  | 'website'
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'xTwitter'
  | 'location'
  | 'socialLinks'
>;

// Session
export interface Session {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
  workspaceId: string;
  username?: string | null;
  avatarUrl?: string | null;
}

// Connected OAuth Account
export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: 'google' | 'apple';
  providerUserId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Workspace
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

// Scan status
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';
export type ScanResult = 'needs_review' | 'passed' | 'failed' | 'pending';

// Scan
export interface Scan {
  id: string;
  name: string;
  target: string;
  kind: string;
  status: ScanStatus;
  result: ScanResult;
  checks: number;
  checksCompleted: number;
  workspaceId: string;
  createdBy: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
}

// Finding classification
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingClassification = 'verified' | 'suspected' | 'inconclusive';
export type FindingStatus = 'open' | 'in_review' | 'remediated' | 'accepted' | 'false_positive';

// Finding
export interface Finding {
  id: string;
  scanId: string;
  title: string;
  severity: FindingSeverity;
  classification: FindingClassification;
  status: FindingStatus;
  target: string;
  detail: string;
  observed: string;
  expected: string;
  impact: string;
  recommendation: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

// Evidence
export interface Evidence {
  id: string;
  findingId: string;
  type: 'observation' | 'tool_result' | 'log' | 'screenshot' | 'reference';
  title: string;
  content: string;
  source: string;
  isAiGenerated: boolean;
  createdAt: string;
}

// Approval
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  findingId: string;
  title: string;
  description: string;
  proposedChange: string;
  risk: string;
  expectedResult: string;
  affectedTarget: string;
  status: ApprovalStatus;
  requestedBy: string;
  reviewedBy: string | null;
  reviewComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

// Remediation
export type RemediationStatus = 'proposed' | 'approved' | 'executing' | 'completed' | 'failed' | 'retesting' | 'verified';

export interface Remediation {
  id: string;
  approvalId: string;
  findingId: string;
  status: RemediationStatus;
  proposedFix: string;
  executedAt: string | null;
  executedBy: string | null;
  result: string | null;
  retestResult: string | null;
  retestAt: string | null;
  createdAt: string;
}

// Audit event
export type AuditAction = 
  | 'user.login' | 'user.logout' | 'user.signup' | 'user.password_change'
  | 'scan.created' | 'scan.started' | 'scan.completed' | 'scan.failed'
  | 'finding.created' | 'finding.updated' | 'finding.classified'
  | 'evidence.collected'
  | 'approval.requested' | 'approval.approved' | 'approval.rejected'
  | 'remediation.proposed' | 'remediation.executed' | 'remediation.retested'
  | 'settings.changed'
  | 'user.role_changed' | 'user.invited' | 'user.suspended' | 'user.restored'
  | 'workspace.created' | 'workspace.updated'
  | 'integration.connected' | 'integration.disconnected';

export interface AuditEvent {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  targetType: string | null;
  targetId: string | null;
  detail: string;
  metadata: string | null; // JSON string
  ipAddress: string | null;
  createdAt: string;
}

// Notification
export type NotificationType = 'scan_completed' | 'critical_finding' | 'approval_required' | 'remediation_executed' | 'retest_failed' | 'integration_failure';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

// Integration
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: IntegrationStatus;
  description: string;
  capabilities: string;
  lastActivity: string | null;
  configuredBy: string | null;
  workspaceId: string;
  createdAt: string;
}

// Settings
export interface UserSettings {
  userId: string;
  theme: 'dark' | 'light' | 'system';
  compactMode: boolean;
  reducedMotion: boolean;
  density: 'comfortable' | 'compact' | 'spacious';
  defaultWorkspace: string | null;
  notifications: boolean;
  updatedAt: string;
}

// API response helpers
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// User Profile Update
export interface UserProfileUpdate {
  name?: string;
  username?: string;
  bio?: string;
  dob?: string;
  avatarUrl?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  xTwitter?: string;
  location?: string;
  isOnboarded?: boolean;
}

// ── Agent Domain Model ───────────────────────────────────────────────────────

export type AgentStatus = 'verified' | 'needs_attention' | 'critical' | 'drift_detected';
export type AgentEnvironment = 'production' | 'staging' | 'sandbox';
export type AgentRiskLevel = 'low' | 'moderate' | 'elevated' | 'critical';

export interface AgentCapability {
  id: string;
  name: string;
  category: 'filesystem' | 'shell' | 'network' | 'datastore' | 'tool_invocation' | 'sensitive_resource';
  description: string;
  plainEnglish: string;
  riskLevel: AgentRiskLevel;
  requiresApproval: boolean;
  scope: string; // e.g., "Read-only: /workspace", "Subprocess execution: python3 only"
  isObserved: boolean;
  isUsed: boolean;
}

export interface TrustNode {
  id: string;
  label: string;
  type: 'agent' | 'tool' | 'resource' | 'data' | 'service';
  status: 'safe' | 'warning' | 'critical';
  details?: string;
}

export interface TrustEdge {
  from: string;
  to: string;
  label: string;
  risk: 'low' | 'moderate' | 'elevated' | 'critical';
  requiresHumanGate: boolean;
}

export interface TrustGraphData {
  nodes: TrustNode[];
  edges: TrustEdge[];
}

export interface DriftDetails {
  detectedAt: string;
  diffSummary: string;
  baselineConfig: Record<string, unknown>;
  activeConfig: Record<string, unknown>;
  riskAnalysis: string;
  recommendedAction: string;
}

export interface ShadowTelemetry {
  observedCallsCount: number;
  requestedTools: string[];
  unusedTools: string[];
  overprivilegedScopes: string[];
  recommendedMinPermissions: string[];
  lastObservedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  status: AgentStatus;
  environment: AgentEnvironment;
  ownerId: string;
  workspaceId: string;
  trustScore: number; // 0 - 100
  shadowMode: boolean;
  capabilities: AgentCapability[];
  trustGraph: TrustGraphData;
  driftStatus: 'clean' | 'drift_detected';
  driftDetails: DriftDetails | null;
  shadowTelemetry: ShadowTelemetry;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Page props
export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ── AI Security Workspace Conversations ──────────────────────────────────────

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: string[];
  diff?: string;
  timestamp: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  messages: AiChatMessage[];
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}
