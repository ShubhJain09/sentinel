'use client';

import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Integration, Session } from '@/app/lib/types';
import Link from 'next/link';

interface IntegrationsContentProps {
  integrations: Integration[];
  session: Session;
}

export default function IntegrationsContent({ integrations, session }: IntegrationsContentProps) {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Ecosystem Connectivity
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            Integration Status
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Simplified outcome-oriented operational status of connected agents, security engines, and external tools.
          </p>
        </div>

        {session.role === 'owner' && (
          <Link
            href="/owner/integrations"
            onClick={() => triggerHaptic('selection')}
            className="btn-primary h-8 text-[12.5px]"
          >
            <Icon name="sliders" size={14} />
            <span>Manage in Owner Center &rarr;</span>
          </Link>
        )}
      </div>

      {/* ── Outcome-Oriented State Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* State 1: AI Services */}
        <div className="card-spacious p-5 flex items-center justify-between space-x-3">
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Autonomous Intelligence
            </span>
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">
              AI Services
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)]">
              Active reasoning and inspection engine
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
            <span className="w-2 h-2 rounded-full bg-[var(--status-safe)] animate-pulse" />
            Connected
          </span>
        </div>

        {/* State 2: Security Engine */}
        <div className="card-spacious p-5 flex items-center justify-between space-x-3">
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Boundary Verification
            </span>
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">
              Security Engine
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)]">
              Deterministic AST &amp; containment guards
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
            <span className="w-2 h-2 rounded-full bg-[var(--status-safe)]" />
            Available
          </span>
        </div>

        {/* State 3: Integration */}
        <div className="card-spacious p-5 flex items-center justify-between space-x-3">
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
              Connector Mesh
            </span>
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">
              Integration
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)]">
              Managed by platform administrators
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
            <span className="w-2 h-2 rounded-full bg-[var(--status-warning)]" />
            Needs Attention
          </span>
        </div>
      </div>

      {/* ── Informational Notice ────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] flex items-start gap-3">
        <Icon name="shield" size={17} className="text-[var(--accent-blue)] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            Administrative Access Boundary
          </span>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            Technical integration credentials, API endpoints, webhook subscriptions, and MCP server transports are maintained exclusively by platform administrators in the Owner Control Center.
          </p>
        </div>
      </div>

      {/* ── High-Level Service Overview Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="card-spacious p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-selected)] border border-[var(--border-hairline)] text-[var(--accent-blue)] flex items-center justify-center">
                  <Icon
                    name={
                      item.type.includes('Agent')
                        ? 'code'
                        : item.type.includes('Tool')
                        ? 'box'
                        : 'settings'
                    }
                    size={16}
                  />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    item.status === 'connected'
                      ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                      : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)] border border-[var(--border-hairline)]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'connected' ? 'bg-[var(--status-safe)]' : 'bg-[var(--text-tertiary)]'
                    }`}
                  />
                  {item.status === 'connected' ? 'Connected' : 'Standby'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{item.name}</h3>
                <span className="text-[11px] font-mono text-[var(--accent-blue)]">{item.type}</span>
                <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>Status: {item.status === 'connected' ? 'Operational' : 'Configuration Required'}</span>
              <span className="font-mono tabular-numbers">
                {item.lastActivity ? new Date(item.lastActivity).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
