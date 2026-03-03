interface Props {
  data: { url: string };
}

export function PortfolioView({ data }: Props) {
  return (
    <div className="rounded-xl border border-default bg-surface p-5 shadow-sm animate-fade-in">
      <h2 className="heading-md mb-4">Aneeq&apos;s Portfolio</h2>
      <iframe
        src={data.url}
        title="Aneeq Hassan's Portfolio"
        className="w-full rounded-lg border border-default"
        style={{ height: "700px" }}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-xs text-[var(--color-text-info)] hover:opacity-80 transition-opacity"
      >
        Open in a new tab →
      </a>
    </div>
  );
}
