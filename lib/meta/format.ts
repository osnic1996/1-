function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Matches the "9. 16. 07:17" style used throughout the dashboard.
export function formatTimestampLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}. ${pad(d.getDate())}. ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
