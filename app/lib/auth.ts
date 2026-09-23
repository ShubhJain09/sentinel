import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/app/lib/types';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const encodedKey = new TextEncoder().encode(secretKey);

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
  workspaceId: string;
  username?: string | null;
  avatarUrl?: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: Session): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await new SignJWT(user as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  try {
    const cookieStore = await cookies();
    cookieStore.set('sentinel-session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.APP_URL?.startsWith('http://localhost'),
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
  } catch (e) {
    // If called in a context where cookies() cannot be directly mutated
  }

  return { token: session, expiresAt };
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('sentinel-session')?.value;

  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });

    const userSession = payload as unknown as Session;

    // Cross-check live user state in database
    const { getUserById } = await import('@/app/lib/db');
    const dbUser = getUserById(userSession.userId);
    if (!dbUser || !dbUser.isActive) {
      return null;
    }

    const ownerEmails = (process.env.OWNER_EMAIL || 'owner@sentinel.security,workspaceshubhjain@gmail.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());

    if (dbUser.email && ownerEmails.includes(dbUser.email.toLowerCase())) {
      userSession.role = 'owner';
    } else {
      userSession.role = dbUser.role;
    }

    userSession.name = dbUser.name;
    userSession.email = dbUser.email;
    userSession.username = dbUser.username;
    userSession.avatarUrl = dbUser.avatarUrl;
    userSession.avatarInitials = dbUser.avatarInitials;

    return userSession;
  } catch (error) {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('sentinel-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete('sentinel-session');
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'operator@***';
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (local.length <= 1) {
    return `${local}***@${domain}`;
  }
  return `${local[0]}***@${domain}`;
}

export interface LoginChallengeSession {
  challengeId: string;
  userId: string;
  email: string;
  maskedEmail: string;
}

export async function createLoginChallengeToken(payload: LoginChallengeSession): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(encodedKey);
}

export async function setLoginChallengeCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('sentinel_login_challenge', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.APP_URL?.startsWith('http://localhost'),
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });
  } catch (e) {
    // If called in context where cookies() cannot be mutated
  }
}

export async function getLoginChallengeSession(): Promise<LoginChallengeSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sentinel_login_challenge')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });

    return payload as unknown as LoginChallengeSession;
  } catch {
    return null;
  }
}

export async function clearLoginChallengeCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('sentinel_login_challenge', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
    cookieStore.delete('sentinel_login_challenge');
  } catch {
    // Ignore
  }
}

export function getProviderConfig() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
  const isGoogleConfigured = Boolean(googleClientId && googleClientSecret);

  const appleClientId = process.env.APPLE_CLIENT_ID?.trim() || '';
  const appleTeamId = process.env.APPLE_TEAM_ID?.trim() || '';
  const appleKeyId = process.env.APPLE_KEY_ID?.trim() || '';
  const applePrivateKey = process.env.APPLE_PRIVATE_KEY?.trim() || '';
  const isAppleConfigured = Boolean(appleClientId && (applePrivateKey || appleKeyId || appleTeamId));

  return {
    google: {
      configured: isGoogleConfigured,
      clientIdMasked: isGoogleConfigured ? `${googleClientId.substring(0, 12)}...apps.googleusercontent.com` : null,
    },
    apple: {
      configured: isAppleConfigured,
      clientIdMasked: isAppleConfigured ? appleClientId : null,
      teamIdMasked: isAppleConfigured && appleTeamId ? `${appleTeamId.substring(0, 4)}...` : null,
    },
    passkey: {
      available: true,
      standard: 'FIDO2 / WebAuthn Level 3',
    },
    password: {
      enabled: true,
      algorithm: 'bcrypt (salt cost 10)',
    },
  };
}

export interface OAuthLoginResult {
  session: Session;
  sessionToken: string;
  expiresAt: Date;
  isNewUser: boolean;
  needsOnboarding: boolean;
}

export async function handleOAuthLogin({
  provider,
  providerUserId,
  email,
  name,
  avatarUrl,
}: {
  provider: 'google' | 'apple';
  providerUserId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<OAuthLoginResult> {
  const { 
    getConnectedAccountByProvider, 
    createConnectedAccount, 
    getUserByEmail, 
    getUserById, 
    generateId, 
    now, 
    getDb 
  } = await import('@/app/lib/db');

  const normalizedEmail = email.trim().toLowerCase();
  const db = getDb();
  const timestamp = now();

  // 1. Check if provider account is already linked
  const existingAccount = getConnectedAccountByProvider(provider, providerUserId);
  if (existingAccount) {
    const user = getUserById(existingAccount.userId);
    if (user && user.isActive) {
      db.prepare(`
        INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
        VALUES (?, 'user.oauth_login', ?, ?, 'user', ?, ?, ?)
      `).run(
        generateId(),
        user.id,
        user.name,
        user.id,
        `Operator authenticated via ${provider} OAuth/OIDC`,
        timestamp
      );

      const session: Session = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarInitials: user.avatarInitials,
        workspaceId: user.workspaceId,
        username: user.username,
        avatarUrl: user.avatarUrl,
      };
      const { token: sessionToken, expiresAt } = await createSession(session);
      const needsOnboarding = !user.username || user.isOnboarded === false;
      return { session, sessionToken, expiresAt, isNewUser: false, needsOnboarding };
    }
  }

  // 2. Check if a user with this email exists
  const existingUser = getUserByEmail(normalizedEmail);
  if (existingUser) {
    if (!existingUser.isActive) {
      throw new Error('Account has been deactivated. Contact platform owner.');
    }

    createConnectedAccount({
      userId: existingUser.id,
      provider,
      providerUserId,
      email: normalizedEmail,
      name: name || existingUser.name,
      avatarUrl: avatarUrl || existingUser.avatarUrl,
    });

    if (!existingUser.avatarUrl && avatarUrl) {
      db.prepare('UPDATE users SET avatarUrl = ?, updatedAt = ? WHERE id = ?').run(avatarUrl, timestamp, existingUser.id);
    }

    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'user.oauth_link', ?, ?, 'user', ?, ?, ?)
    `).run(
      generateId(),
      existingUser.id,
      existingUser.name,
      existingUser.id,
      `Linked ${provider} identity (${providerUserId}) to existing operator account`,
      timestamp
    );

    const session: Session = {
      userId: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      avatarInitials: existingUser.avatarInitials,
      workspaceId: existingUser.workspaceId,
      username: existingUser.username,
      avatarUrl: existingUser.avatarUrl || avatarUrl || null,
    };
    const { token: sessionToken, expiresAt } = await createSession(session);
    const needsOnboarding = !existingUser.username || existingUser.isOnboarded === false;
    return { session, sessionToken, expiresAt, isNewUser: false, needsOnboarding };
  }

  // 3. Create a new user safely
  const newUserId = generateId();
  const displayName = name?.trim() || normalizedEmail.split('@')[0];
  const nameParts = displayName.split(' ');
  const avatarInitials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  const ownerEmails = (process.env.OWNER_EMAIL || 'owner@sentinel.security,workspaceshubhjain@gmail.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());
  const role = ownerEmails.includes(normalizedEmail) ? 'owner' : 'user';

  const randomSalt = generateId() + generateId();
  const passwordHash = await hashPassword(randomSalt);
  const defaultWorkspaceId = 'default-workspace-id';

  db.prepare(`
    INSERT INTO users (id, email, name, passwordHash, role, avatarInitials, workspaceId, avatarUrl, createdAt, updatedAt, isActive, isOnboarded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
  `).run(
    newUserId,
    normalizedEmail,
    displayName,
    passwordHash,
    role,
    avatarInitials,
    defaultWorkspaceId,
    avatarUrl || null,
    timestamp,
    timestamp
  );

  createConnectedAccount({
    userId: newUserId,
    provider,
    providerUserId,
    email: normalizedEmail,
    name: displayName,
    avatarUrl: avatarUrl || null,
  });

  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'user.oauth_signup', ?, ?, 'user', ?, ?, ?)
  `).run(
    generateId(),
    newUserId,
    displayName,
    newUserId,
    `New operator provisioned via ${provider} OAuth/OIDC identity`,
    timestamp
  );

  const session: Session = {
    userId: newUserId,
    email: normalizedEmail,
    name: displayName,
    role,
    avatarInitials,
    workspaceId: defaultWorkspaceId,
    avatarUrl: avatarUrl || null,
  };
  const { token: sessionToken, expiresAt } = await createSession(session);
  return { session, sessionToken, expiresAt, isNewUser: true, needsOnboarding: true };
}
