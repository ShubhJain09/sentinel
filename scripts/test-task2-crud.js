const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'sentinel.db');
const db = new Database(dbPath);

console.log('Testing Task 2 DB & CRUD operations...');

// 1. Check conversations table
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_conversations'").all();
if (tables.length === 0) {
  console.error('FAIL: ai_conversations table does not exist');
  process.exit(1);
}
console.log('✓ ai_conversations table exists');

// 2. Insert test conversation
const testId = 'test-conv-' + Date.now();
const userId = 'owner-user-id';
const now = new Date().toISOString();
const messages = JSON.stringify([{ id: '1', role: 'user', content: 'Test prompt', timestamp: '12:00 PM' }]);

db.prepare(`
  INSERT INTO ai_conversations (id, userId, workspaceId, title, messages, shareToken, createdAt, updatedAt)
  VALUES (?, ?, 'default-workspace-id', 'Initial Title', ?, NULL, ?, ?)
`).run(testId, userId, messages, now, now);

console.log('✓ Created conversation:', testId);

// 3. Rename test
const updatedTitle = 'Renamed Security Audit';
db.prepare('UPDATE ai_conversations SET title = ?, updatedAt = ? WHERE id = ?').run(updatedTitle, new Date().toISOString(), testId);
const renamed = db.prepare('SELECT title FROM ai_conversations WHERE id = ?').get(testId);
if (renamed.title !== updatedTitle) {
  console.error('FAIL: Rename did not persist');
  process.exit(1);
}
console.log('✓ Renamed conversation title successfully to:', renamed.title);

// 4. Share test
const shareToken = 'sc_share_test_' + Date.now();
db.prepare('UPDATE ai_conversations SET shareToken = ?, updatedAt = ? WHERE id = ?').run(shareToken, new Date().toISOString(), testId);
const shared = db.prepare('SELECT shareToken FROM ai_conversations WHERE id = ?').get(testId);
if (shared.shareToken !== shareToken) {
  console.error('FAIL: Share token did not persist');
  process.exit(1);
}
console.log('✓ Generated and persisted shareToken:', shared.shareToken);

// 5. Delete test
db.prepare('DELETE FROM ai_conversations WHERE id = ?').run(testId);
const deleted = db.prepare('SELECT id FROM ai_conversations WHERE id = ?').get(testId);
if (deleted) {
  console.error('FAIL: Conversation not deleted');
  process.exit(1);
}
console.log('✓ Deleted conversation permanently');

db.close();
console.log('✅ Task 2 CRUD Database test passed cleanly!');
