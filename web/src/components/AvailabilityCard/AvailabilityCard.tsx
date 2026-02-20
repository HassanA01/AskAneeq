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
      <a
        href={data.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--color-background-info-surface)] text-[var(--color-text-info)] text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Book a Meeting
      </a>
    </div>
  );
}
