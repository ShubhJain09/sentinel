'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Session, Finding, Scan, AiConversation, AiChatMessage } from '@/app/lib/types';
import {
  saveAiConversationAction,
  renameAiConversationAction,
  deleteAiConversationAction,
  shareAiConversationAction,
} from '@/app/actions/ai-workspace';

interface ProviderMeta {
  id: string;
  name: string;
  type: string;
  description: string;
  isConfigured: boolean;
  capabilities: string[];
}

interface WorkspaceContentProps {
  session: Session;
  providers: ProviderMeta[];
  findings: Finding[];
  scans: Scan[];
  initialConversations?: AiConversation[];
}

export default function WorkspaceContent({
  session,
  providers,
  findings,
  scans,
  initialConversations = [],
}: WorkspaceContentProps) {
  const [conversations, setConversations] = useState<AiConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [messages, setMessages] = useState<AiChatMessage[]>(
    initialConversations[0]?.messages || []
  );
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');
  const [copiedPatch, setCopiedPatch] = useState<string | null>(null);

  // Contextual menu state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; flipUp: boolean } | null>(null);

  // Modals & Sheets
  const [renameTarget, setRenameTarget] = useState<AiConversation | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AiConversation | null>(null);

  const [shareTarget, setShareTarget] = useState<AiConversation | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareCopied, setShareCopied] = useState(false);

  // Global subtle toast feedback
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' } | null>(null);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        !Array.from(menuButtonRefs.current.values()).some(btn => btn?.contains(target))
      ) {
        setMenuOpenId(null);
        setMenuPosition(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpenId(null);
        setMenuPosition(null);
      }
    }
    function handleScroll() {
      setMenuOpenId(null);
      setMenuPosition(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuOpenId]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const SUGGESTIONS = [
    {
      title: 'Audit MCP tool permissions',
      prompt: 'Inspect current MCP server configurations and flag tools running without boundary isolation.',
    },
    {
      title: 'Remediate S3 bucket finding',
      prompt: 'Synthesize a Terraform and IAM policy patch to close public access on prod-customer-vault-eu.',
    },
    {
      title: 'Verify sandbox path traversal',
      prompt: 'Test filesystem sandboxes against relative directory escape "../" in file_read tool handlers.',
    },
    {
      title: 'Analyze agent execution logs',
      prompt: 'Correlate recent runtime telemetry with MITRE ATLAS agent security matrix.',
    },
  ];

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchHistory.trim()) return true;
    return c.title.toLowerCase().includes(searchHistory.toLowerCase());
  });

  const handleSelectConversation = (conv: AiConversation) => {
    triggerHaptic('tap');
    setActiveConversationId(conv.id);
    setMessages(conv.messages || []);
    setMenuOpenId(null);
  };

  const handleNewChat = () => {
    triggerHaptic('selection');
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
    setMenuOpenId(null);
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isGenerating) return;

    triggerHaptic('tap');
    const userMsg: AiChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsGenerating(true);

    // Multi-stage agent synthesis
    setTimeout(async () => {
      triggerHaptic('success');
      setIsGenerating(false);

      const assistantMsg: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I have analyzed the request against Sentinel's security baseline. Here is the verified deterministic mitigation:`,
        steps: [
          'Interpreting request parameters and target telemetry…',
          'Executing sandboxed static analysis on tool handlers…',
          'Synthesizing minimal-privilege security patch…',
          'Verifying compliance against NIST SP 800-53 / SOC-2…',
        ],
        diff: `// Fix for Boundary Escape & Tool Enclave\n+ import { resolvePathWithinBoundary } from '@/security/enclave';\n\n  async function handleToolExecution(userPath: string) {\n+   const resolved = resolvePathWithinBoundary(process.env.SANDBOX_ROOT, userPath);\n+   if (!resolved) throw new SecurityBoundaryError('Directory escape prevented');\n-   return fs.readFileSync(userPath, 'utf8');\n+   return fs.readFileSync(resolved, 'utf8');\n  }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      if (!activeConversationId) {
        // Create new conversation
        const title = query.length > 36 ? `${query.slice(0, 36).trim()}…` : query;
        const res = await saveAiConversationAction({
          title,
          messages: finalMessages,
        });
        if (res.success && res.conversation) {
          setConversations((prev) => [res.conversation!, ...prev]);
          setActiveConversationId(res.conversation.id);
        }
      } else {
        // Update existing conversation
        const currentConv = conversations.find((c) => c.id === activeConversationId);
        const title = currentConv?.title || 'Security Investigation';
        const res = await saveAiConversationAction({
          id: activeConversationId,
          title,
          messages: finalMessages,
        });
        if (res.success && res.conversation) {
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversationId ? res.conversation! : c))
          );
        }
      }
    }, 1200);
  };

  // ── Rename Action ────────────────────────────────────────────────────────
  const openRenameModal = (conv: AiConversation) => {
    setRenameTarget(conv);
    setRenameInput(conv.title);
    setRenameError(null);
    setMenuOpenId(null);
  };

  const handleSaveRename = async () => {
    if (!renameTarget) return;
    const trimmed = renameInput.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 80) {
      setRenameError('Title must be between 2 and 80 characters.');
      return;
    }

    triggerHaptic('selection');
    const targetId = renameTarget.id;

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) => (c.id === targetId ? { ...c, title: trimmed } : c))
    );
    setToast({ message: 'Conversation renamed', type: 'success' });
    setRenameTarget(null);

    await renameAiConversationAction(targetId, trimmed);
  };

  // ── Delete Action ────────────────────────────────────────────────────────
  const openDeleteSheet = (conv: AiConversation) => {
    setDeleteTarget(conv);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    triggerHaptic('warning');
    const targetId = deleteTarget.id;

    // Optimistic update
    setConversations((prev) => prev.filter((c) => c.id !== targetId));
    if (activeConversationId === targetId) {
      handleNewChat();
    }
    setToast({ message: 'Conversation deleted', type: 'info' });
    setDeleteTarget(null);

    await deleteAiConversationAction(targetId);
  };

  // ── Copy Transcript Action ───────────────────────────────────────────────
  const handleCopyTranscript = (conv: AiConversation) => {
    triggerHaptic('tap');
    setMenuOpenId(null);

    const transcriptLines = [
      `# ${conv.title}`,
      `Exported from Sentinel AI Enclave • ${new Date().toLocaleString()}`,
      `Security Context: Sandbox Isolated`,
      '',
      '---',
      '',
    ];

    for (const msg of conv.messages || []) {
      const speaker = msg.role === 'user' ? 'OPERATOR' : 'SENTINEL ENCLAVE';
      transcriptLines.push(`[${speaker}] (${msg.timestamp})`);
      transcriptLines.push(msg.content);
      if (msg.steps && msg.steps.length > 0) {
        transcriptLines.push('\nEnclave Execution Log:');
        for (const s of msg.steps) {
          transcriptLines.push(`- ${s}`);
        }
      }
      if (msg.diff) {
        transcriptLines.push(`\nProposed Boundary Patch:\n\`\`\`typescript\n${msg.diff}\n\`\`\``);
      }
      transcriptLines.push('\n');
    }

    const fullText = transcriptLines.join('\n');
    navigator.clipboard.writeText(fullText).then(() => {
      setToast({ message: 'Copied transcript to clipboard', type: 'success' });
    });
  };

  // ── Share Action ─────────────────────────────────────────────────────────
  const openShareModal = async (conv: AiConversation) => {
    triggerHaptic('tap');
    setMenuOpenId(null);
    setShareTarget(conv);
    setShareCopied(false);

    const res = await shareAiConversationAction(conv.id);
    if (res.success && res.shareUrl) {
      setShareUrl(res.shareUrl);
    } else {
      const fallbackUrl = `${window.location.origin}/ai-workspace?share=sc_live_${conv.id}`;
      setShareUrl(fallbackUrl);
    }
  };

  const handleCopyShareLink = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setToast({ message: 'Share link copied to clipboard', type: 'success' });
      setTimeout(() => setShareCopied(false), 2500);
    });
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-48px)] overflow-hidden bg-[var(--bg-canvas)] select-none font-sans relative">
      {/* ─── Global Toast Feedback ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full liquid-glass-card border border-[var(--border-strong)] text-[12.5px] font-medium text-[var(--text-primary)] shadow-2xl animate-fade">
          <Icon name="check" size={13} className="text-[var(--status-safe)]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── Left Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-68 sm:w-76 shrink-0 border-r border-[var(--border-hairline)] bg-[var(--surface-primary)]/50 p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-4">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-full btn-primary text-[13px] font-medium shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Icon name="plus" size={14} />
            <span>New chat</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Icon
              name="search"
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
            />
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Search history…"
              className="input-apple h-8.5 pl-8 pr-3 text-[12px] rounded-xl w-full"
            />
          </div>

          {/* History List */}
          <div className="space-y-4 pt-1 max-h-[calc(100vh-230px)] overflow-y-auto custom-scrollbar">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2 block mb-1.5">
                Saved Conversations ({filteredConversations.length})
              </span>
              <div className="space-y-1">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((item) => {
                    const isSelected = activeConversationId === item.id;
                    const isMenuOpen = menuOpenId === item.id;

                    return (
                      <div key={item.id} className="relative group">
                        <div
                          className={`w-full flex items-center justify-between pl-3 pr-1.5 py-2 rounded-xl text-left text-[12.5px] transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--surface-solid)] text-[var(--accent-blue)] font-medium shadow-xs border border-[var(--border-hairline)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent'
                          }`}
                          onClick={() => handleSelectConversation(item)}
                        >
                          <span className="truncate flex-1 pr-2">{item.title}</span>

                          {/* Overflow Menu Button (•••) */}
                          <button
                            type="button"
                            ref={(el) => {
                              if (el) menuButtonRefs.current.set(item.id, el);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic('tap');
                              const isOpening = menuOpenId !== item.id;
                              setMenuOpenId((prev) => (prev === item.id ? null : item.id));
                              if (isOpening) {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const menuHeight = 180; // approx height of dropdown
                                const flipUp = rect.bottom + menuHeight > window.innerHeight;
                                setMenuPosition({
                                  top: flipUp ? rect.top : rect.bottom + 4,
                                  left: Math.max(8, Math.min(rect.right - 192, window.innerWidth - 200)),
                                  flipUp,
                                });
                              } else {
                                setMenuPosition(null);
                              }
                            }}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isMenuOpen || isSelected
                                ? 'opacity-100 hover:bg-[var(--surface-hover)] text-[var(--text-primary)]'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                            }`}
                            aria-label="Conversation actions"
                            title="Conversation actions"
                          >
                            <span className="text-[13px] font-bold leading-none tracking-tight">•••</span>
                          </button>
                        </div>

                        {/* Floating Contextual Dropdown */}
                        {/* Dropdown removed and moved to portal at end of file */}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-2 py-4 text-[12px] text-[var(--text-tertiary)] text-center">
                    No matching conversations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Provider Connection Status */}
        <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11.5px] text-[var(--text-secondary)] px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--status-safe)] animate-pulse" />
            <span className="font-medium text-[var(--text-primary)]">Sentinel AI</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--well)] text-[var(--text-tertiary)]">
            SANDBOX ACTIVE
          </span>
        </div>
      </aside>

      {/* ─── Main Chat Canvas ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden relative">
        {messages.length === 0 ? (
          /* Empty / Welcome State with 3D Glass Orb */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6">
            {/* Luminous 3D Glass Orb Visual */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl p-1 liquid-glass border border-white/80 dark:border-white/10 group transform transition-transform duration-500 hover:scale-105">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/sentinel-glass-orb.jpg"
                  alt="Sentinel Intelligence Orb"
                  fill
                  priority
                  sizes="144px"
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                How can I help you today?
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                Sentinel AI operates with sandbox isolation to inspect runtime tool escapes, synthesize code fixes, and explain CVE telemetry.
              </p>
            </div>

            {/* 4 Suggestion Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(item.prompt)}
                  className="liquid-glass-card p-4 rounded-2xl text-left hover:border-[var(--accent-blue)]/60 transition-all hover:-translate-y-0.5 group cursor-pointer"
                >
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11.5px] text-[var(--text-tertiary)] mt-1 line-clamp-1">
                    {item.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl w-full mx-auto space-y-6 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Icon name="code" size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-[24px] p-5 space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent-blue)] text-white'
                      : 'liquid-glass-card text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                  }`}
                >
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Multi-step execution disclosure */}
                  {msg.steps && (
                    <div className="p-3.5 rounded-xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Enclave Execution Log
                      </div>
                      <div className="space-y-1">
                        {msg.steps.map((st, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11.5px] text-[var(--text-secondary)] font-mono">
                            <Icon name="check" size={12} className="text-[var(--status-safe)]" />
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Synthesized Diff */}
                  {msg.diff && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                        <span>Proposed Boundary Patch</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('tap');
                            navigator.clipboard.writeText(msg.diff || '');
                            setCopiedPatch(msg.id);
                            setTimeout(() => setCopiedPatch(null), 2000);
                          }}
                          className="hover:text-[var(--accent-blue)] transition-colors cursor-pointer text-[var(--accent-blue)]"
                        >
                          {copiedPatch === msg.id ? '✓ Copied' : 'Copy Patch'}
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-[var(--well)] text-[12px] font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[var(--border-hairline)]">
                        {msg.diff}
                      </pre>
                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href="/approvals"
                          onClick={() => triggerHaptic('selection')}
                          className="btn-primary text-[12px] h-8 px-4 rounded-full"
                        >
                          <span>Submit to Approvals Queue</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] font-mono ${msg.role === 'user' ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-3 text-[13px] text-[var(--text-secondary)] p-4">
                <span className="w-4 h-4 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" />
                <span>Sentinel Enclave reasoning…</span>
              </div>
            )}
          </div>
        )}

        {/* ─── Bottom Pill Input Bar ────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/90 to-transparent">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center bg-[var(--surface-solid)] rounded-full border border-[var(--border-subtle)] p-2 pl-5 shadow-lg focus-within:border-[var(--accent-blue)] transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about security findings, audit MCP tools, or generate fixes…"
                className="flex-1 bg-transparent text-[13.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none pr-3"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setToast({
                      message: 'Telemetry snapshot attached to active enclave session',
                      type: 'info',
                    });
                  }}
                  title="Attach telemetry snapshot or tool logs"
                  className="btn-icon w-8 h-8 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full cursor-pointer"
                  aria-label="Attach file"
                >
                  <Icon name="box" size={15} />
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="w-8 h-8 rounded-full bg-[var(--accent-blue)] text-white disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  aria-label="Send message"
                >
                  <Icon name="arrow" size={13} className="-rotate-90" />
                </button>
              </div>
            </form>

            <div className="text-center pt-2 text-[11px] text-[var(--text-tertiary)]">
              Sentinel AI Enclave v2.6 • Sandboxed deterministic code generation
            </div>
          </div>
        </div>
      </main>

      {/* ─── Rename Modal ──────────────────────────────────────────────────── */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade">
          <div className="w-full max-w-md liquid-glass-card rounded-3xl p-6 space-y-4 shadow-2xl border border-[var(--border-strong)] animate-scale">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Rename Conversation
              </h3>
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="btn-icon w-7 h-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full"
              >
                <Icon name="close" size={13} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Conversation Title
              </label>
              <input
                type="text"
                autoFocus
                value={renameInput}
                onChange={(e) => {
                  setRenameInput(e.target.value);
                  setRenameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setRenameTarget(null);
                }}
                className="input-apple w-full h-10 px-3.5 text-[13px] rounded-xl"
                placeholder="Enter title…"
              />
              {renameError && (
                <p className="text-[11.5px] text-[var(--status-critical)]">{renameError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="btn-secondary text-[12.5px] h-9 px-4 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                className="btn-primary text-[12.5px] h-9 px-4 rounded-full"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Sheet ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade">
          <div className="w-full max-w-md liquid-glass-card rounded-3xl p-6 space-y-4 shadow-2xl border border-[var(--border-strong)] animate-scale">
            <div className="w-10 h-10 rounded-2xl bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)] flex items-center justify-center">
              <Icon name="close" size={18} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Delete conversation?
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                This will permanently remove &ldquo;<strong className="text-[var(--text-primary)]">{deleteTarget.title}</strong>&rdquo; and its enclave execution logs from your workspace.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary text-[12.5px] h-9 px-4 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-destructive text-[12.5px] h-9 px-4 rounded-full"
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Share Modal ──────────────────────────────────────────────────── */}
      {shareTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-6 space-y-5 shadow-2xl border border-[var(--border-strong)] animate-scale">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Share Conversation
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                  Generate a cryptographically-scoped read-only link for workspace operators.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareTarget(null)}
                className="btn-icon w-7 h-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full"
              >
                <Icon name="close" size={13} />
              </button>
            </div>

            {/* Link Box */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Read-Only Workspace Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="input-apple flex-1 h-9 px-3 text-[12px] font-mono text-[var(--text-secondary)] rounded-xl select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="btn-primary text-[12px] h-9 px-4 shrink-0 rounded-full"
                >
                  {shareCopied ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Truthful Enclave Permissions Banner */}
            <div className="p-3.5 rounded-2xl bg-[var(--well)] border border-[var(--well-border)] space-y-1.5">
              <div className="flex items-center gap-2 text-[11.5px] font-semibold text-[var(--text-primary)]">
                <Icon name="shield" size={14} className="text-[var(--accent-blue)]" />
                <span>Truthful Workspace Access Policy</span>
              </div>
              <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                Access is restricted to authorized operators in workspace <strong className="text-[var(--text-primary)]">{session.workspaceId || 'Sentinel Security Ops'}</strong> with RBAC read access to audit logs. External unauthenticated access is blocked by Sentinel Enclave security policies.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShareTarget(null)}
                className="btn-secondary text-[12.5px] h-8.5 px-4 rounded-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Portal-based Context Menu */}
      {menuOpenId && menuPosition && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 p-1.5 liquid-glass-dropdown shadow-2xl rounded-xl border border-[var(--border-strong)] animate-fade"
          style={{
            top: menuPosition.flipUp ? undefined : menuPosition.top,
            bottom: menuPosition.flipUp ? (window.innerHeight - menuPosition.top + 4) : undefined,
            left: menuPosition.left,
            zIndex: 9999,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const conv = conversations.find(c => c.id === menuOpenId);
              if (conv) openRenameModal(conv);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer text-left"
          >
            <Icon name="sliders" size={13} className="text-[var(--accent-blue)]" />
            <span>Rename</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const conv = conversations.find(c => c.id === menuOpenId);
              if (conv) handleCopyTranscript(conv);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer text-left"
          >
            <Icon name="box" size={13} className="text-[var(--accent-blue)]" />
            <span>Copy transcript</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const conv = conversations.find(c => c.id === menuOpenId);
              if (conv) openShareModal(conv);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer text-left"
          >
            <Icon name="arrow" size={13} className="text-[var(--accent-blue)]" />
            <span>Share</span>
          </button>
          <div className="my-1 border-t border-[var(--border-hairline)]" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const conv = conversations.find(c => c.id === menuOpenId);
              if (conv) openDeleteSheet(conv);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] transition-colors cursor-pointer text-left"
          >
            <Icon name="close" size={13} className="text-[var(--status-critical)]" />
            <span>Delete</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
