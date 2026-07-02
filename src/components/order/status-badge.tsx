export function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ").toLowerCase();
  return <span className={`status-badge status-${status.toLowerCase()}`}>{label}</span>;
}
