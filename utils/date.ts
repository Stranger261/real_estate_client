const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const pad = (n: number) => String(n).padStart(2, "0");

export const parseYmd = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatYmd = (ymd: string) => {
  const d = parseYmd(ymd);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const eachDayBetween = (startYmd: string, endYmd: string): string[] => {
  const days: string[] = [];
  const cursor = parseYmd(startYmd);
  cursor.setDate(cursor.getDate() + 1);
  const end = parseYmd(endYmd);
  while (cursor < end) {
    days.push(toYmd(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days ?? [];
};
