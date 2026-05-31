import dayjs from "dayjs";

export function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const scaled = value / 1024 ** index;

  return `${scaled.toFixed(scaled >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "--";
  return `${value.toFixed(1)}%`;
}

export function formatDateTime(value?: number | string | null) {
  if (!value) return "--";

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm") : "--";
}

export function getUsagePercent(used: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (used / total) * 100));
}
