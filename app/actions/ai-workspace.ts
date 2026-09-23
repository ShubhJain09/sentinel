'use server';

import { getSession } from '@/app/lib/auth';
import {
  getAiConversations,
  getAiConversationById,
  saveAiConversation,
  renameAiConversation,
  deleteAiConversation,
  shareAiConversation,
  getDb,
  generateId,
  now,
} from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import type { AiChatMessage, AiConversation } from '@/app/lib/types';

export async function getAiConversationsAction(): Promise<{
  success: boolean;
  conversations?: AiConversation[];
  error?: string;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  try {
    const conversations = getAiConversations(session.userId);
    return { success: true, conversations };
  } catch (err: any) {
    console.error('Failed to get AI conversations:', err);
    return { success: false, error: err.message || 'Failed to fetch conversations' };
  }
}

export async function saveAiConversationAction(conv: {
  id?: string;
  title: string;
  messages: AiChatMessage[];
}): Promise<{
  success: boolean;
  conversation?: AiConversation;
  error?: string;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  if (!conv.title || !conv.title.trim()) {
    return { success: false, error: 'Title is required' };
  }

  try {
    const saved = saveAiConversation({
      id: conv.id,
      userId: session.userId,
      workspaceId: session.workspaceId || 'default-workspace-id',
      title: conv.title.trim().slice(0, 80),
      messages: conv.messages || [],
    });

    revalidatePath('/ai-workspace');
    return { success: true, conversation: saved };
  } catch (err: any) {
    console.error('Failed to save AI conversation:', err);
    return { success: false, error: err.message || 'Failed to save conversation' };
  }
}

export async function renameAiConversationAction(
  id: string,
  newTitle: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  const trimmed = newTitle.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 80) {
    return { success: false, error: 'Title must be between 2 and 80 characters' };
  }

  try {
    const ok = renameAiConversation(id, session.userId, trimmed);
    if (!ok) {
      return { success: false, error: 'Conversation not found or unauthorized' };
    }

    // Record audit event
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'ai_workspace.conversation_renamed', ?, ?, 'conversation', ?, ?, ?)
    `).run(
      generateId(),
      session.userId,
      session.name,
      id,
      `${session.name} renamed conversation to "${trimmed}"`,
      now()
    );

    revalidatePath('/ai-workspace');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to rename conversation:', err);
    return { success: false, error: err.message || 'Failed to rename conversation' };
  }
}

export async function deleteAiConversationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  try {
    const ok = deleteAiConversation(id, session.userId);
    if (!ok) {
      return { success: false, error: 'Conversation not found or unauthorized' };
    }

    // Record audit event
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'ai_workspace.conversation_deleted', ?, ?, 'conversation', ?, ?, ?)
    `).run(
      generateId(),
      session.userId,
      session.name,
      id,
      `${session.name} deleted AI conversation ${id}`,
      now()
    );

    revalidatePath('/ai-workspace');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete conversation:', err);
    return { success: false, error: err.message || 'Failed to delete conversation' };
  }
}

export async function shareAiConversationAction(
  id: string
): Promise<{ success: boolean; shareToken?: string; shareUrl?: string; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  try {
    const token = shareAiConversation(id, session.userId);
    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${host}/ai-workspace?share=${token}`;

    // Record audit event
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'ai_workspace.conversation_shared', ?, ?, 'conversation', ?, ?, ?)
    `).run(
      generateId(),
      session.userId,
      session.name,
      id,
      `${session.name} generated secure share token for conversation ${id}`,
      now()
    );

    revalidatePath('/ai-workspace');
    return { success: true, shareToken: token, shareUrl };
  } catch (err: any) {
    console.error('Failed to share conversation:', err);
    return { success: false, error: err.message || 'Failed to generate share link' };
  }
}
