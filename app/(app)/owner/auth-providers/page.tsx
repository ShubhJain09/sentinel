import { getSession, getProviderConfig } from '@/app/lib/auth';
import { getEmailServiceStatus } from '@/app/lib/email';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Authentication Providers & SSO',
};

export default async function AuthProvidersPage() {
  const session = await getSession();
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const config = getProviderConfig();
  const emailStatus = getEmailServiceStatus();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
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
            Authentication Providers &amp; SSO
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-blue-500/10 text-[var(--accent-blue)] border border-blue-500/20 rounded-full font-bold uppercase tracking-wider">
            Identity &amp; Access Governance
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Inspect OAuth 2.0 / OIDC integrations, W3C WebAuthn hardware passkeys, and authentication policy enforcements across the platform.
        </p>
      </div>

      {/* Provider Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Workspace */}
        <div className="card-spacious p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.25C.45 8.15 0 9.97 0 12s.45 3.85 1.25 5.44l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.56l4.03 3.15c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Google Workspace</h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">OAuth 2.0 / OpenID Connect</span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  config.google.configured
                    ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                    : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    config.google.configured ? 'bg-[var(--status-safe)]' : 'bg-[var(--status-warning)]'
                  }`}
                />
                {config.google.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Enables operators to authenticate through enterprise Google accounts with verified email mapping, anti-CSRF state cookies, and session generation.
            </p>

            <div className="space-y-2 text-[12px] bg-[var(--well)] p-3 rounded-2xl border border-[var(--border-hairline)] font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Client ID:</span>
                <span className="text-[var(--text-primary)]">
                  {config.google.clientIdMasked || 'Not configured in environment'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Redirect URI:</span>
                <span className="text-[var(--accent-blue)]">/api/auth/callback/google</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Scopes:</span>
                <span className="text-[var(--text-secondary)]">openid, email, profile</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)]">
            <details className="group">
              <summary className="text-[12px] font-medium text-[var(--accent-blue)] cursor-pointer hover:underline list-none flex items-center justify-between">
                <span>View Google Setup Instructions</span>
                <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-3 p-3.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[11.5px] text-[var(--text-secondary)] space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">1. Google Cloud Console Configuration</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Go to Google Cloud Console → APIs &amp; Services → Credentials.</li>
                  <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
                  <li>Add Authorized Redirect URI: <code className="bg-[var(--well)] px-1 py-0.5 rounded text-[var(--accent-blue)]">https://your-domain.com/api/auth/callback/google</code></li>
                </ul>
                <p className="font-semibold text-[var(--text-primary)] pt-1">2. Environment Variables (.env.local)</p>
                <pre className="p-2 rounded bg-[var(--well)] text-[10.5px] overflow-x-auto text-[var(--text-primary)] font-mono">
{`GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here`}
                </pre>
              </div>
            </details>
          </div>
        </div>

        {/* Apple ID */}
        <div className="card-spacious p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4 fill-current text-[var(--text-primary)]" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.64-2.2.52-3.06-.4C3.79 16.17 4.36 9.51 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.11zM12.03 9.2C11.88 7.16 13.5 5.5 15.4 5.35c.28 2.35-2.15 4.12-3.37 3.85z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Apple</h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">Apple ID OpenID Connect</span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  config.apple.configured
                    ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                    : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    config.apple.configured ? 'bg-[var(--status-safe)]' : 'bg-[var(--status-warning)]'
                  }`}
                />
                {config.apple.configured ? 'Active' : 'Not configured'}
              </span>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Provides Apple ID sign-on using cryptographic ID token verification, form_post return mode, and secure first-consent name capture.
            </p>

            <div className="space-y-2 text-[12px] bg-[var(--well)] p-3 rounded-2xl border border-[var(--border-hairline)] font-mono">
              {!config.apple.configured && (
                <div className="flex justify-between items-center text-[var(--status-warning)] font-sans text-[11.5px] font-medium pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-tertiary)]">Notice:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--status-warning-subtle)] border border-[var(--status-warning-border)] text-[var(--status-warning)] text-[10.5px]">
                    Requires Apple Developer Program
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Service ID:</span>
                <span className="text-[var(--text-primary)]">
                  {config.apple.clientIdMasked || 'Not configured in environment'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Callback URI:</span>
                <span className="text-[var(--accent-blue)]">/api/auth/callback/apple</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Response Mode:</span>
                <span className="text-[var(--text-secondary)]">form_post (code + id_token)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)]">
            <details className="group">
              <summary className="text-[12px] font-medium text-[var(--accent-blue)] cursor-pointer hover:underline list-none flex items-center justify-between">
                <span>View Apple Setup Instructions</span>
                <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-3 p-3.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[11.5px] text-[var(--text-secondary)] space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">1. Apple Developer Account Configuration</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>In Certificates, Identifiers &amp; Profiles, create a <strong>Services ID</strong>.</li>
                  <li>Enable Sign in with Apple, configure your verified Web Domain and Return URL: <code className="bg-[var(--well)] px-1 py-0.5 rounded text-[var(--accent-blue)]">https://your-domain.com/api/auth/callback/apple</code></li>
                  <li>Create a Sign in with Apple Key (.p8).</li>
                </ul>
                <p className="font-semibold text-[var(--text-primary)] pt-1">2. Environment Variables (.env.local)</p>
                <pre className="p-2 rounded bg-[var(--well)] text-[10.5px] overflow-x-auto text-[var(--text-primary)] font-mono">
{`APPLE_CLIENT_ID=com.yourorg.sentinel.service
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."`}
                </pre>
              </div>
            </details>
          </div>
        </div>

        {/* Passkeys (WebAuthn / FIDO2) */}
        <div className="card-spacious p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shadow-xs text-[var(--accent-blue)]">
                  <Icon name="shield" size={17} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Passkeys / WebAuthn</h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">{config.passkey.standard}</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-safe)]" />
                Active
              </span>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Hardware-bound biometric authentication (Apple Touch ID, Face ID, Windows Hello, and YubiKey FIDO2 keys). Zero shared secrets transmitted over the network.
            </p>

            <div className="space-y-2 text-[12px] bg-[var(--well)] p-3 rounded-2xl border border-[var(--border-hairline)] font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Relying Party:</span>
                <span className="text-[var(--text-primary)]">Dynamic Hostname Enclave</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">User Verification:</span>
                <span className="text-[var(--text-secondary)]">Preferred (Biometric / PIN)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Enrollment:</span>
                <span className="text-[var(--text-secondary)]">Profile → Security Tab</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)] text-[12px] text-[var(--text-secondary)]">
            <span>Passkeys are natively supported in all modern WebKit, Chromium, and Gecko engines.</span>
          </div>
        </div>

        {/* Master Password Auth */}
        <div className="card-spacious p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shadow-xs text-[var(--text-primary)]">
                  <Icon name="lock" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Master Password</h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">Cryptographic Salted Hash</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-safe)]" />
                Enabled
              </span>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Standard local credential storage backed by adaptive work factor key derivation, timing-attack-safe comparisons, and account lockout protection.
            </p>

            <div className="space-y-2 text-[12px] bg-[var(--well)] p-3 rounded-2xl border border-[var(--border-hairline)] font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Derivation Engine:</span>
                <span className="text-[var(--text-primary)]">{config.password.algorithm}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Session Format:</span>
                <span className="text-[var(--text-secondary)]">Signed JWT (jose HS256)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-tertiary)]">Cookie Security:</span>
                <span className="text-[var(--text-secondary)]">HttpOnly, SameSite=Lax</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)] text-[12px] text-[var(--text-secondary)]">
            <span>Passkey and OAuth logins link directly with this master operator record.</span>
          </div>
        </div>

        {/* Transactional Email Delivery */}
        <div className="card-spacious p-6 flex flex-col justify-between space-y-5 md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center shadow-xs text-[var(--accent-blue)]">
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Transactional Email Delivery</h3>
                  <span className="text-[11px] text-[var(--text-secondary)]">Password Reset &amp; Recovery Dispatch</span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  emailStatus.configured
                    ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                    : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    emailStatus.configured ? 'bg-[var(--status-safe)]' : 'bg-[var(--status-warning)]'
                  }`}
                />
                {emailStatus.configured ? 'Active' : 'Standby / Local Outbox'}
              </span>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Dispatches cryptographically signed password reset links and security alerts with anti-enumeration protection and SHA-256 token hashing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] bg-[var(--well)] p-3 rounded-2xl border border-[var(--border-hairline)] font-mono">
              <div>
                <span className="text-[var(--text-tertiary)] block text-[11px] font-sans">Active Engine:</span>
                <span className="text-[var(--text-primary)] font-semibold capitalize">{emailStatus.provider}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[11px] font-sans">Sender (From):</span>
                <span className="text-[var(--text-primary)] truncate block">{emailStatus.fromAddress}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[11px] font-sans">Delivery Mode:</span>
                <span className={emailStatus.configured ? 'text-[var(--status-safe)]' : 'text-[var(--status-warning)] font-sans text-[11.5px]'}>
                  {emailStatus.configured ? 'Live External SMTP/API' : 'Dev Outbox & Security Audit Log'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)]">
            <details className="group">
              <summary className="text-[12px] font-medium text-[var(--accent-blue)] cursor-pointer hover:underline list-none flex items-center justify-between">
                <span>View Email Setup Instructions</span>
                <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-3 p-3.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[11.5px] text-[var(--text-secondary)] space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">Option A: Resend API (Recommended)</p>
                <pre className="p-2 rounded bg-[var(--well)] text-[10.5px] overflow-x-auto text-[var(--text-primary)] font-mono">
{`RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="Sentinel Security <security@your-domain.com>"`}
                </pre>
                <p className="font-semibold text-[var(--text-primary)] pt-1">Option B: Standard SMTP Relay</p>
                <pre className="p-2 rounded bg-[var(--well)] text-[10.5px] overflow-x-auto text-[var(--text-primary)] font-mono">
{`SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
EMAIL_FROM="Sentinel Security <security@your-domain.com>"`}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Security Guarantees & Safeguards */}
      <div className="card-spacious p-6 space-y-4">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Icon name="shield" size={16} className="text-[var(--accent-blue)]" />
          OAuth Identity Linking &amp; Takeover Protections
        </h2>
        <div className="space-y-3 divide-y divide-[var(--border-hairline)] text-[12.5px]">
          <div className="pt-3 first:pt-0 flex justify-between items-start gap-4">
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Verified Email Verification Barrier</span>
              <span className="text-[var(--text-secondary)]">
                Sentinel strictly verifies that third-party identities have confirmed email ownership with Google or Apple before permitting automatic account linking.
              </span>
            </div>
            <span className="font-mono text-[var(--status-safe)] font-semibold shrink-0">ENFORCED</span>
          </div>

          <div className="pt-3 flex justify-between items-start gap-4">
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Role Integrity &amp; Privilege Preservation</span>
              <span className="text-[var(--text-secondary)]">
                OAuth sign-in never alters or downgrades an existing user&apos;s role, permissions, or master credentials upon linking.
              </span>
            </div>
            <span className="font-mono text-[var(--status-safe)] font-semibold shrink-0">ENFORCED</span>
          </div>

          <div className="pt-3 flex justify-between items-start gap-4">
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Orphan Account Disconnection Lock</span>
              <span className="text-[var(--text-secondary)]">
                Operators are prevented from disconnecting an OAuth provider if it is their sole remaining authentication method.
              </span>
            </div>
            <span className="font-mono text-[var(--status-safe)] font-semibold shrink-0">ENFORCED</span>
          </div>

          <div className="pt-3 flex justify-between items-start gap-4">
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Audited Identity Lifecycles</span>
              <span className="text-[var(--text-secondary)]">
                Every OAuth login (<code className="font-mono text-[11px]">user.oauth_login</code>), identity link (<code className="font-mono text-[11px]">user.oauth_link</code>), and signup (<code className="font-mono text-[11px]">user.oauth_signup</code>) emits an immutable audit event.
              </span>
            </div>
            <span className="font-mono text-[var(--status-safe)] font-semibold shrink-0">LOGGED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
