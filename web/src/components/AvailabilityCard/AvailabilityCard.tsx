import { InlineWidget } from "react-calendly";

interface Props {
  data: { bookingUrl: string; name: string };
}

export function AvailabilityCard({ data }: Props) {
  return (
    <div className="rounded-xl border border-default bg-surface p-5 shadow-sm animate-fade-in">
      <h2 className="heading-md mb-1">Schedule Time with {data.name}</h2>
      <p className="text-sm text-secondary mb-4">
        Available for coffee chats, interviews, or collaborations.
      </p>
      <InlineWidget url={data.bookingUrl} styles={{ height: "630px" }} />
      <a
        href={data.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-xs text-[var(--color-text-info)] hover:opacity-80 transition-opacity"
      >
        Can&apos;t see it? Open in a new tab →
      </a>
    </div>
  );
}
