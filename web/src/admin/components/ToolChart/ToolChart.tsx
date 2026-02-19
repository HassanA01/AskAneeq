interface ToolCount {
  tool: string;
  count: number;
}

interface ToolChartProps {
  toolCounts: ToolCount[];
}

export function ToolChart({ toolCounts }: ToolChartProps) {
  if (toolCounts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
        <p className="font-mono text-sm text-slate-500 tracking-widest uppercase">
          No data yet.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...toolCounts.map((t) => t.count));
  const totalCount = toolCounts.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="flex gap-1">
          <span className="block w-2 h-2 rounded-full bg-red-500/70" />
          <span className="block w-2 h-2 rounded-full bg-amber-500/70" />
          <span className="block w-2 h-2 rounded-full bg-emerald-500/70" />
        </div>
        <span className="font-mono text-xs text-slate-500 tracking-widest uppercase">
          tool_invocations
        </span>
      </div>

      {/* Chart rows */}
      <div className="px-5 py-4 space-y-4">
        {toolCounts.map((entry, index) => {
          const widthPct =
            maxCount > 0 ? Math.round((entry.count / maxCount) * 100) : 0;
          const sharePct =
            totalCount > 0
              ? Math.round((entry.count / totalCount) * 100)
              : 0;
          const isLeader = entry.count === maxCount && maxCount > 0;

          return (
            <div key={entry.tool} className="group">
              {/* Label row */}
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-mono text-xs text-slate-300 tracking-tight truncate max-w-[70%]">
                  {entry.tool}
                </span>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="font-mono text-xs text-slate-500">
                    {sharePct}%
                  </span>
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      isLeader ? "text-amber-400" : "text-slate-300"
                    }`}
                  >
                    {entry.count}
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="relative h-6 w-full rounded bg-slate-800">
                {/* Subtle grid lines */}
                {[25, 50, 75].map((mark) => (
                  <span
                    key={mark}
                    className="absolute top-0 bottom-0 w-px bg-slate-700/50"
                    style={{ left: `${mark}%` }}
                  />
                ))}

                {/* Fill bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 rounded transition-all duration-700 ease-out ${
                    isLeader
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : index % 2 === 0
                      ? "bg-gradient-to-r from-teal-700 to-teal-600"
                      : "bg-gradient-to-r from-slate-600 to-slate-500"
                  }`}
                  style={{ width: `${widthPct}%` }}
                  role="meter"
                  aria-valuenow={entry.count}
                  aria-valuemax={maxCount}
                  aria-label={`${entry.tool}: ${entry.count} calls`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer scale — aria-hidden so screen readers skip decorative labels */}
      <div className="flex justify-between px-5 pb-3" aria-hidden="true">
        <span className="font-mono text-[10px] text-slate-600">0</span>
        <span className="font-mono text-[10px] text-slate-600">
          {Math.round(maxCount / 2)}
        </span>
        <span className="font-mono text-[10px] text-slate-600">
          max: {maxCount}
        </span>
      </div>
    </div>
  );
}
