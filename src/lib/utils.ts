import { clsx, type ClassValue } from "clsx";
import { format, getISOWeek } from "date-fns";
import { sv } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return format(date, "d MMM yyyy", { locale: sv });
}

export function formatDateTime(date: Date) {
  return format(date, "d MMM yyyy HH:mm", { locale: sv });
}

export function weekNumber(date: Date) {
  return getISOWeek(date);
}

export function isActiveProjectStatus(status: string) {
  return !["klart", "fakturerat", "installt"].includes(status);
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
