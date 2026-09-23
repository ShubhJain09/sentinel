'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { useTheme } from '@/app/components/theme-provider';
import { triggerHaptic } from '@/app/lib/haptics';

export default function SettingsContent() {
  const { theme: currentTheme, setTheme: setAppTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Appearance');
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [density, setDensity] = useState('Comfortable');
  const [savedNotice, setSavedNotice] = useState(false);

  const tabs = [
    { name: 'Appearance', icon: 'overview' },
    { name: 'AI & Agents', icon: 'code' },
    { name: 'Workspace', icon: 'box' },
    { name: 'Notifications', icon: 'bell' },
    { name: 'Security', icon: 'shield' },
  ];

  function triggerSave() {
    triggerHaptic('tap');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
            Preferences
          </span>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mt-0.5">
            Workspace Settings
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Configure appearance mode, information density, agent endpoints, and security parameters.
          </p>
        </div>
        {savedNotice && (
          <span className="text-[12px] text-[var(--status-safe)] font-medium animate-fade">
            Preferences saved to session
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bento-card overflow-hidden min-h-[560px]">
        {/* Left Nav (4 cols) */}
        <div className="md:col-span-4 border-r border-[var(--border-hairline)] p-3.5 bg-[var(--surface-solid)] space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab(tab.name);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium transition-all text-left active:scale-[0.98] cursor-pointer ${
                activeTab === tab.name
                  ? 'bg-[var(--surface-selected)] text-[var(--accent-blue)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon name={tab.icon as any} size={15} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Right Content (8 cols) */}
        <div className="md:col-span-8 p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {activeTab === 'Appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Interface &amp; Display
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Fine-tune visual appearance, information density, and layout parameters.
                </p>
              </div>

              <div className="space-y-6 divide-y divide-[var(--border-hairline)]">
                {/* Theme Selector */}
                <div className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)]">
                      Interface Theme
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)]">
                      Switch between macOS dark mode, pure light mode, or system automatic.
                    </div>
                  </div>
                  <div className="segmented-control">
                    {(['dark', 'light', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setAppTheme(t);
                          triggerSave();
                        }}
                        className={`segmented-pill capitalize ${currentTheme === t ? 'is-active' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode Toggle */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)]">
                      Compact Investigation Rows
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)]">
                      Display higher data density for telemetry logs and scan results.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={compactMode}
                    onClick={() => {
                      setCompactMode(!compactMode);
                      triggerSave();
                    }}
                    className={`toggle-track ${compactMode ? 'is-checked' : ''}`}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)]">
                      Reduced Motion
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)]">
                      Minimize subtle animations across window switches and cards.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={reducedMotion}
                    onClick={() => {
                      setReducedMotion(!reducedMotion);
                      triggerSave();
                    }}
                    className={`toggle-track ${reducedMotion ? 'is-checked' : ''}`}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>

                {/* Density Segmented Control */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)]">
                      Content Density
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)]">
                      Adjust padding across tables and card layouts.
                    </div>
                  </div>
                  <div className="segmented-control">
                    {['Comfortable', 'Compact'].map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setDensity(d);
                          triggerSave();
                        }}
                        className={`segmented-pill ${density === d ? 'is-active' : ''}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AI & Agents' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Intelligence &amp; Security Services
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Current platform execution status and boundary enforcement gates.
                </p>
              </div>

              <div className="space-y-4">
                <div className="well-inset p-4 space-y-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-semibold text-[var(--text-primary)]">
                      Security Engine
                    </span>
                    <span className="text-[var(--status-safe)] font-semibold text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-safe)]" />
                      Available
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Deterministic AST taint checking, directory canonicalization, and boundary verification.
                  </p>
                </div>

                <div className="well-inset p-4 space-y-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-semibold text-[var(--text-primary)]">
                      AI Services
                    </span>
                    <span className="text-[var(--status-safe)] font-semibold text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-safe)]" />
                      Connected
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Operational autonomous reasoning and telemetry evaluation runtime.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--well-border)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-primary)] block">
                    Administrative Delegation
                  </span>
                  <p className="text-[11.5px] text-[var(--text-secondary)]">
                    Technical provider keys, model routing, and gateway configurations are restricted to platform owners in the Owner Control Center.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Workspace' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Workspace Controls
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Logical tenant partitioning and security boundary containment.
                </p>
              </div>

              <div className="well-inset p-4 space-y-2">
                <div className="text-[12px] font-semibold text-[var(--text-primary)]">
                  Default Environment Root
                </div>
                <code className="block p-2.5 rounded-xl well-inset font-mono text-[12px] text-[var(--accent-blue)]">
                  /Users/sentinel/workspace
                </code>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  All relative path operations are verified to ensure canonical containment within this root directory.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Alert Preferences
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Configure security event dispatch and notification thresholds.
                </p>
              </div>

              <div className="space-y-3 text-[12px]">
                <label className="flex items-center gap-3 p-3.5 rounded-xl well-inset cursor-pointer hover:border-[var(--border-strong)] transition-colors">
                  <input type="checkbox" defaultChecked className="accent-[var(--accent-blue)] rounded" />
                  <span className="text-[var(--text-primary)]">Notify on Critical Severity Boundary Violations</span>
                </label>
                <label className="flex items-center gap-3 p-3.5 rounded-xl well-inset cursor-pointer hover:border-[var(--border-strong)] transition-colors">
                  <input type="checkbox" defaultChecked className="accent-[var(--accent-blue)] rounded" />
                  <span className="text-[var(--text-primary)]">Notify when Human-in-the-Loop Approval is Requested</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Security Parameters
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Session authentication and cryptographic token validation.
                </p>
              </div>

              <div className="well-inset p-4 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Session Protocol</span>
                  <span className="font-mono text-[var(--status-safe)]">JWT HS256 (7-day duration)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Credential Storage</span>
                  <span className="font-mono text-[var(--status-safe)]">Bcrypt salted hashes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
