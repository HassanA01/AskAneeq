interface QueryEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  user_message: string | null;
  timestamp: string;
}

interface QueryLogProps {
  events: QueryEvent[];
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

export function QueryLog({ events }: QueryLogProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
        <p className="font-mono text-sm text-slate-500 tracking-widest uppercase">
          No queries yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      {/* Header — same chrome as ToolChart/CategoryChart */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="flex gap-1">
          <span className="block w-2 h-2 rounded-full bg-red-500/70" />
          <span className="block w-2 h-2 rounded-full bg-amber-500/70" />
          <span className="block w-2 h-2 rounded-full bg-emerald-500/70" />
        </div>
        <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">
          query_log
        </span>
        <span className="ml-auto font-mono text-xs text-slate-600 tabular-nums">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[7rem_1fr_1fr_2fr_2fr] gap-x-4 px-5 py-2 border-b border-slate-800/60 bg-slate-800/30">
        {["Timestamp", "Tool", "Category", "Query", "User Message"].map((col) => (
          <span
            key={col}
            className="font-mono text-[10px] text-slate-600 tracking-widest uppercase"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-800/60">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`grid grid-cols-[7rem_1fr_1fr_2fr_2fr] gap-x-4 px-5 py-2.5 items-center transition-colors hover:bg-slate-800/40 ${
              index % 2 === 0 ? "bg-transparent" : "bg-slate-800/20"
            }`}
          >
            {/* Timestamp */}
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {formatTime(event.timestamp)}
            </span>

            {/* Tool */}
            <span className="font-mono text-xs text-teal-400 truncate">
              {event.tool}
            </span>

            {/* Category */}
            {event.category ? (
              <span className="inline-flex items-center">
                <span className="font-mono text-xs text-slate-300 bg-slate-800 rounded px-1.5 py-0.5 truncate">
                  {event.category}
                </span>
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-600">—</span>
            )}

            {/* Query */}
            <span className="font-mono text-xs text-slate-400 truncate">
              {event.query ?? "—"}
            </span>

            {/* User Message */}
            {event.user_message ? (
              <span
                className="font-mono text-xs text-slate-300 truncate"
                title={event.user_message}
              >
                {event.user_message.length > 80
                  ? event.user_message.slice(0, 80) + "…"
                  : event.user_message}
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-600">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
