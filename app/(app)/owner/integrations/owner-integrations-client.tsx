'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Integration } from '@/app/lib/types';
import Link from 'next/link';

export default function OwnerIntegrationsClient({ integrations }: { integrations: Integration[] }) {
  const [selectedInt, setSelectedInt] = useState<Integration | null>(null);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)] hover:underline mb-3"
        >
          <Icon name="arrow-left" size={14} />
          Owner Control Center
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            Technical Integrations &amp; Protocol Connectors
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Configure upstream model inference keys, Model Context Protocol configurations, webhook subscriptions, and service mesh endpoints.
        </p>
      </div>

      {/* Grid of integrations with administrative controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="card-spacious p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-hairline)] text-[var(--accent-blue)] flex items-center justify-center">
                  <Icon
                    name={
                      item.type.includes('Agent')
                        ? 'code'
                        : item.type.includes('Tool')
                        ? 'box'
                        : 'settings'
                    }
                    size={17}
                  />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    item.status === 'connected'
                      ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                      : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'connected' ? 'bg-[var(--status-safe)]' : 'bg-[var(--status-warning)]'
                    }`}
                  />
                  {item.status === 'connected' ? 'Connected' : 'Configuration Required'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{item.name}</h3>
                <span className="text-[11px] font-mono text-[var(--accent-blue)]">{item.type}</span>
                <p className="text-[12px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="well-inset p-3 space-y-1">
                <span className="text-[9.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                  Exposed Capabilities
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] font-mono tabular-numbers">
                  {item.capabilities}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                {item.id}
              </span>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedInt(item);
                }}
                className="btn-secondary text-[12px] h-7.5 px-3"
              >
                Configure Credentials
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Config Modal */}
      {selectedInt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade">
          <div className="bg-[var(--surface-solid)] border border-[var(--border-hairline)] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Configure {selectedInt.name}
                </h3>
                <span className="text-[11.5px] font-mono text-[var(--accent-blue)]">
                  {selectedInt.id}
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedInt(null);
                }}
                className="btn-icon w-8 h-8"
                aria-label="Close configuration"
              >
                <Icon name="close" size={14} />
              </button>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Define upstream API secrets or protocol paths for {selectedInt.name}. Values are stored encrypted and evaluated within isolated subprocesses.
            </p>

            <div className="space-y-2">
              <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Required Environment Variable
              </span>
              <div className="well-inset p-3.5 font-mono text-[12px] text-[var(--accent-blue)]">
                {selectedInt.id === 'int-trueforge' && 'TRUEFORGE_API_KEY=••••••••••••••••••••••••'}
                {selectedInt.id === 'int-mcp' && 'MCP_CONFIG_PATH=.agents/mcp_config.json'}
                {selectedInt.id === 'int-groq' && 'GROQ_API_KEY=••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--well)] border border-[var(--well-border)] text-[12px] text-[var(--text-secondary)]">
              To apply live credentials securely without exposing them in browser storage, navigate to the <Link href="/owner/secrets" className="text-[var(--accent-blue)] underline">Environment Secrets</Link> panel.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedInt(null);
                }}
                className="btn-primary"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
