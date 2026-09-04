import { useState, useEffect } from 'react';

export function formatCurrentTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
  return hours + ':' + minutesStr + ' ' + ampm;
}

export function formatMessageTime(input?: string | number | Date | null): string {
  if (!input) return formatCurrentTime();

  if (typeof input === 'string') {
    const trimmed = input.trim();
    const timeMatch = trimmed.match(/^0?(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2];
      const ap = timeMatch[3].toUpperCase();
      return h + ':' + m + ' ' + ap;
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) {
    return formatCurrentTime();
  }

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
  return hours + ':' + minutesStr + ' ' + ampm;
}

export function formatConversationDate(input?: string | number | Date | null): string {
  if (!input) return formatCurrentTime();

  if (typeof input === 'string') {
    const trimmed = input.trim();
    const timeMatch = trimmed.match(/^0?(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2];
      const ap = timeMatch[3].toUpperCase();
      return h + ':' + m + ' ' + ap;
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) return formatCurrentTime();

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return formatMessageTime(d);
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}

export function formatDateDivider(input?: string | number | Date | null): string {
  if (!input) return 'Today';

  const d = new Date(input);
  if (isNaN(d.getTime())) return 'Today';

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function useLiveClock(intervalMs: number = 30000): string {
  const [clockStr, setClockStr] = useState<string>(() => formatCurrentTime());

  useEffect(() => {
    setClockStr(formatCurrentTime());
    const timer = setInterval(() => {
      setClockStr(formatCurrentTime());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return clockStr;
}
