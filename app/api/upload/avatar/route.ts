'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { updateUserProfile, generateId, now, getDb } from '@/app/lib/db';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Read file bytes and validate magic bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

    if (!isJpeg && !isPng && !isWebp && !isGif) {
      return NextResponse.json(
        { error: 'File content does not match a valid image format.' },
        { status: 400 }
      );
    }

    // Create upload directory if not exists
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Remove old avatar if exists (with strict directory containment check)
    const db = getDb();
    const user = db.prepare('SELECT avatarUrl FROM users WHERE id = ?').get(session.userId) as { avatarUrl?: string } | undefined;
    if (user?.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const sanitizedRel = path.basename(user.avatarUrl);
      const oldPath = path.join(UPLOAD_DIR, sanitizedRel);
      try { unlinkSync(oldPath); } catch { /* file may not exist */ }
    }

    // Derive trusted extension strictly from verified image magic bytes
    let safeExt = 'jpg';
    if (isPng) safeExt = 'png';
    else if (isWebp) safeExt = 'webp';
    else if (isGif) safeExt = 'gif';

    const filename = `${session.userId}-${generateId().substring(0, 8)}.${safeExt}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    writeFileSync(filepath, buffer);

    // Update user profile
    const avatarUrl = `/uploads/avatars/${filename}`;
    const timestamp = now();
    updateUserProfile(session.userId, { avatarUrl, updatedAt: timestamp } as any);

    // Audit log
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'user.avatar_upload', ?, ?, 'user', ?, 'Operator uploaded new profile picture', ?)
    `).run(generateId(), session.userId, session.name, session.userId, timestamp);

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove existing avatar file (with strict directory containment check)
    const db = getDb();
    const user = db.prepare('SELECT avatarUrl FROM users WHERE id = ?').get(session.userId) as { avatarUrl?: string } | undefined;
    if (user?.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const sanitizedRel = path.basename(user.avatarUrl);
      const oldPath = path.join(UPLOAD_DIR, sanitizedRel);
      try { unlinkSync(oldPath); } catch { /* file may not exist */ }
    }

    // Clear avatar URL
    const timestamp = now();
    updateUserProfile(session.userId, { avatarUrl: null, updatedAt: timestamp } as any);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
