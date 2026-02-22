import Database from "better-sqlite3";

export interface AnalyticsEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  user_message: string | null;
  timestamp: string;
}

export class AnalyticsStore {
  private db: Database.Database;
  private readonly stmtInsert: Database.Statement;
  private readonly stmtGetToolCounts: Database.Statement;
  private readonly stmtGetCategoryCounts: Database.Statement;
  private readonly stmtGetRecentEvents: Database.Statement;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        tool         TEXT NOT NULL,
        query        TEXT,
        category     TEXT,
        user_message TEXT,
        timestamp    TEXT NOT NULL
      )
    `);
    this.stmtInsert = this.db.prepare(
      "INSERT INTO analytics_events (tool, query, category, timestamp, user_message) VALUES (?, ?, ?, ?, ?)"
    );
    this.stmtGetToolCounts = this.db.prepare(
      "SELECT tool, COUNT(*) as count FROM analytics_events GROUP BY tool ORDER BY count DESC"
    );
    this.stmtGetCategoryCounts = this.db.prepare(
      "SELECT category, COUNT(*) as count FROM analytics_events WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC"
    );
    this.stmtGetRecentEvents = this.db.prepare(
      "SELECT * FROM analytics_events ORDER BY timestamp DESC, id DESC LIMIT ?"
    );
  }

  insert(event: { tool: string; query?: string; category?: string; user_message?: string }): void {
    this.stmtInsert.run(
      event.tool,
      event.query ?? null,
      event.category ?? null,
      new Date().toISOString(),
      event.user_message ?? null
    );
  }

  getToolCounts(): { tool: string; count: number }[] {
    return this.stmtGetToolCounts.all() as { tool: string; count: number }[];
  }

  getCategoryCounts(): { category: string; count: number }[] {
    return this.stmtGetCategoryCounts.all() as { category: string; count: number }[];
  }

  getRecentEvents(limit = 50): AnalyticsEvent[] {
    return this.stmtGetRecentEvents.all(limit) as AnalyticsEvent[];
  }

  close(): void {
    this.db.close();
  }
}

let _store: AnalyticsStore | null = null;

export function initStore(dbPath: string): AnalyticsStore {
  _store = new AnalyticsStore(dbPath);
  return _store;
}

export function getStore(): AnalyticsStore | null {
  return _store;
}
