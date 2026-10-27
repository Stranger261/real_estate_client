export const toNumber = (raw: string) => Number(raw.trim().replace(/,/g, ""));
export const optionalNumber = (raw: string) =>
  raw.trim() ? toNumber(raw) : undefined;
