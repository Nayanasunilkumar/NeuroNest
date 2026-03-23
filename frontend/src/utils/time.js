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

export const parseISTDateTime = (dateValue, timeValue = "00:00:00") => {
  const dateRaw = String(dateValue || "").trim();
  if (!dateRaw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateRaw);
  if (!match) return null;

  const [, yearStr, monthStr, dayStr] = match;
  const [hourStr = "0", minuteStr = "0", secondStr = "0"] = String(timeValue || "00:00:00").split(":");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);
  if ([year, month, day, hour, minute, second].some((part) => Number.isNaN(part))) return null;

  // Convert IST wall-clock to UTC epoch.
  const utcMs = Date.UTC(year, month - 1, day, hour - 5, minute - 30, second, 0);
  const dt = new Date(utcMs);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const formatDateFromISTDate = (dateValue, options = {}) => {
  const dt = parseISTDateTime(dateValue, "00:00:00");
  if (!dt) return "";
  return dt.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
};

export const formatClockTimeIST = (timeValue) => {
  if (!timeValue) return "";
  const dt = parseISTDateTime("2000-01-01", timeValue);
  if (!dt) return String(timeValue);
  return dt.toLocaleTimeString("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const toEpochMs = (value) => {
  const dt = parseServerDate(value);
  return dt ? dt.getTime() : 0;
};

export const formatTimeIST = (value, options = {}) => {
  const dt = parseServerDate(value);
  if (!dt) return "";
  return dt.toLocaleTimeString("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
};

export const formatDateIST = (value, options = {}) => {
  const dt = parseServerDate(value);
  if (!dt) return "";
  return dt.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  });
};

export const formatDateTimeIST = (value, options = {}) => {
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
    ...options,
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

export const calculateAgeIST = (dobValue) => {
  const birthDate = parseServerDate(dobValue);
  if (!birthDate) return "N/A";
  
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : "N/A";
};

export const getISTHour = (date = new Date()) => {
  return Number(new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  }).format(date));
};
