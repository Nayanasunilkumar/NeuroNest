const IST_TIMEZONE = "Asia/Kolkata";
const IST_DATE_PARTS = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const parseServerDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  // Handle backend naive datetime format like: "2026-02-19 03:41:00"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(raw)) {
    const normalized = raw.replace(" ", "T");
    const dt = new Date(`${normalized}Z`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const toEpochMs = (value) => {
  const dt = parseServerDate(value);
  return dt ? dt.getTime() : 0;
};

export const formatTimeIST = (value) => {
  const dt = parseServerDate(value);
  if (!dt) return "";
  return dt.toLocaleTimeString("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateIST = (value) => {
  const dt = parseServerDate(value);
  if (!dt) return "";
  return dt.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTimeIST = (value) => {
  const dt = parseServerDate(value);
  if (!dt) return "";
  return dt.toLocaleString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const getISTDayKey = (value) => {
  const dt = parseServerDate(value);
  if (!dt) return "";
  const parts = IST_DATE_PARTS.formatToParts(dt);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
};

export const getRelativeDayLabelIST = (value, now = new Date()) => {
  const dt = parseServerDate(value);
  if (!dt) return "";

  const msgKey = getISTDayKey(dt);
  const todayKey = getISTDayKey(now);
  const yesterdayKey = getISTDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  if (msgKey === todayKey) return "Today";
  if (msgKey === yesterdayKey) return "Yesterday";

  return dt.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
