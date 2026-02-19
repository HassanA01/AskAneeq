import { useState, useEffect, useCallback } from "react";
import { ToolChart } from "./components/ToolChart";
import { CategoryChart } from "./components/CategoryChart";
import { QueryLog } from "./components/QueryLog";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ToolCount {
  tool: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface QueryEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  timestamp: string;
}

interface SummaryData {
  toolCounts: ToolCount[];
  categoryCounts: CategoryCount[];
}

interface EventsData {
  events: QueryEvent[];
}

/* ------------------------------------------------------------------ */
/*  Login Screen                                                        */
/* ------------------------------------------------------------------ */

interface LoginProps {
  onLogin: (token: string) => Promise<"unauthorized" | "error" | true>;
}

function LoginScreen({ onLogin }: LoginProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await onLogin(token.trim());
    if (result === "unauthorized") {
      setError("Invalid token. Please try again.");
    } else if (result === "error") {
      setError("Server error. Please try again later.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Scan-line atmosphere overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* Ambient glow behind card */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          width: "480px",
          height: "320px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Window chrome */}
        <div className="rounded-t-xl border border-slate-800 bg-slate-900 px-4 py-3 flex items-center gap-2 border-b-0">
          <span className="block w-3 h-3 rounded-full bg-red-500/70" />
          <span className="block w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="block w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="ml-3 font-mono text-xs text-slate-500 tracking-widest uppercase">
            admin_access — askaneeq
          </span>
        </div>

        {/* Card body */}
        <div className="rounded-b-xl border border-t-0 border-slate-800 bg-slate-900 px-8 py-8">
          {/* Prompt header */}
          <div className="mb-6">
            <p className="font-mono text-[10px] text-slate-600 tracking-widest uppercase mb-1">
              $ ssh admin@askaneeq.dev
            </p>
            <h1 className="font-mono text-lg font-bold text-slate-100 tracking-tight">
              Authentication required
            </h1>
            <p className="font-mono text-xs text-slate-500 mt-1">
              Enter your admin token to access the analytics dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-slate-500 tracking-widest uppercase mb-1.5">
                Token
              </label>
              <input
                type="password"
                placeholder="Admin token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="current-password"
                spellCheck={false}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || token.trim().length === 0}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-900 font-mono text-sm font-bold py-2.5 px-4 transition-colors tracking-wide"
            >
              {loading ? "Authenticating…" : "Sign in"}
            </button>
          </form>

          {/* Footer hint */}
          <p className="mt-6 font-mono text-[10px] text-slate-700 text-center tracking-widest uppercase">
            AskAneeq Admin Console
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Shell                                                     */
/* ------------------------------------------------------------------ */

interface DashboardProps {
  summary: SummaryData;
  events: QueryEvent[];
  onLogout: () => void;
}

function Dashboard({ summary, events, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Scan-line texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Window dots */}
          <div className="flex gap-1.5">
            <span className="block w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="block w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 flex-1">
            <span className="font-mono text-[10px] text-slate-600 tracking-widest uppercase hidden sm:block">
              askaneeq /
            </span>
            <span className="font-mono text-sm text-amber-400 font-bold tracking-wide">
              admin_dashboard
            </span>
          </div>

          {/* Status dot */}
          <div className="flex items-center gap-2 mr-4 hidden sm:flex">
            <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-600 tracking-widest uppercase">
              live
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="font-mono text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 rounded-lg px-3 py-1.5 transition-colors tracking-wide"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <p className="font-mono text-[10px] text-slate-600 tracking-widest uppercase mb-1">
            $ analytics --live --all
          </p>
          <h2 className="font-mono text-xl font-bold text-slate-100 tracking-tight">
            Analytics Dashboard
          </h2>
        </div>

        {/* Top row — two charts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tool Calls panel */}
          <section aria-labelledby="tool-calls-heading">
            <h3
              id="tool-calls-heading"
              className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2"
            >
              <span className="text-amber-500">›_</span>
              Tool Calls
            </h3>
            <ToolChart toolCounts={summary.toolCounts} />
          </section>

          {/* Category Breakdown panel */}
          <section aria-labelledby="category-heading">
            <h3
              id="category-heading"
              className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2"
            >
              <span className="text-emerald-500">›_</span>
              Category Breakdown
            </h3>
            <CategoryChart categoryCounts={summary.categoryCounts} />
          </section>
        </div>

        {/* Bottom row — full-width query log */}
        <section aria-labelledby="recent-queries-heading">
          <h3
            id="recent-queries-heading"
            className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2"
          >
            <span className="text-teal-500">›_</span>
            Recent Queries
          </h3>
          <QueryLog events={events} />
        </section>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App root — login gate + state machine                              */
/* ------------------------------------------------------------------ */

export function App() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("adminToken")
  );
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [events, setEvents] = useState<QueryEvent[]>([]);
  const [ready, setReady] = useState(false);

  /** Fetch summary + events with a given token. Returns true on success. */
  const loadDashboard = useCallback(
    async (tok: string): Promise<"unauthorized" | "error" | true> => {
      try {
        const summaryRes = await fetch("/api/analytics/summary", {
          headers: { Authorization: `Bearer ${tok}` },
        });
        if (!summaryRes.ok) {
          return summaryRes.status === 401 ? "unauthorized" : "error";
        }

        const summaryData: SummaryData = await summaryRes.json();

        const eventsRes = await fetch("/api/analytics/events", {
          headers: { Authorization: `Bearer ${tok}` },
        });
        const eventsData: EventsData = eventsRes.ok
          ? await eventsRes.json()
          : { events: [] };

        setSummary(summaryData);
        setEvents(eventsData.events);
        return true;
      } catch {
        return "error";
      }
    },
    []
  );

  /* Auto-load if token already stored */
  useEffect(() => {
    if (token) {
      loadDashboard(token).then((result) => {
        if (result !== true) {
          sessionStorage.removeItem("adminToken");
          setToken(null);
        }
        setReady(true);
      });
    } else {
      setReady(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called by LoginScreen on submit */
  async function handleLogin(
    inputToken: string
  ): Promise<"unauthorized" | "error" | true> {
    const result = await loadDashboard(inputToken);
    if (result === true) {
      sessionStorage.setItem("adminToken", inputToken);
      setToken(inputToken);
    }
    return result;
  }

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    setToken(null);
    setSummary(null);
    setEvents([]);
  }

  /* Don't flash login while auto-loading */
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="font-mono text-xs text-slate-600 tracking-widest uppercase animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  if (!token || !summary) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Dashboard summary={summary} events={events} onLogout={handleLogout} />
  );
}
