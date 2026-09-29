import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';

// Only login and revocation write to disk; playback and presence stay transient.
export class PersistentSessionStore extends Map {
  constructor(filename) {
    super();
    this.filename = filename;
    if (existsSync(filename)) {
      const entries = JSON.parse(readFileSync(filename, 'utf8'));
      if (!Array.isArray(entries)) throw new Error('Invalid session storage.');
      for (const [token, session] of entries) {
        if (typeof token !== 'string' || !session?.username || !['admin', 'user'].includes(session.role) || !session.csrfToken) throw new Error('Invalid stored session.');
        super.set(token, { ...session, lastSeenAt: 0 });
      }
    }
  }
  save(entries) {
    mkdirSync(path.dirname(this.filename), { recursive: true });
    const temporary = `${this.filename}.tmp`;
    writeFileSync(temporary, JSON.stringify(entries.map(([token, session]) => {
      const { playback, ...persistent } = session;
      return [token, persistent];
    })), { mode: 0o600 });
    renameSync(temporary, this.filename);
  }
  set(token, session) {
    const next = new Map(this);
    next.set(token, session);
    this.save([...next]);
    return super.set(token, session);
  }
  delete(token) {
    if (!this.has(token)) return false;
    this.save([...this].filter(([key]) => key !== token));
    return super.delete(token);
  }
  clear() {
    this.save([]);
    super.clear();
  }
}

export function sessionCookieName(host) {
  const port = String(host || '').match(/:(\d+)$/u)?.[1] || 'default';
  return `ms_session_${port}`;
}
