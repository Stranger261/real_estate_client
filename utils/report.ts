import type { BadgeTone } from "@/utils/offer";

export type ReportCategory =
  | "SEXUAL_HARASSMENT"
  | "HARASSMENT_OR_THREATS"
  | "SCAM_OR_FRAUD"
  | "SPAM"
  | "OTHER";

export const REPORT_OPTIONS: {
  value: ReportCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: "SEXUAL_HARASSMENT",
    label: "Sexual harassment",
    hint: "Unwanted sexual messages, requests, or advances",
  },
  {
    value: "HARASSMENT_OR_THREATS",
    label: "Harassment or threats",
    hint: "Insults, intimidation, or threats",
  },
  {
    value: "SCAM_OR_FRAUD",
    label: "Scam or fraud",
    hint: "Asking for money outside the app, fake listings, or phishing",
  },
  {
    value: "SPAM",
    label: "Spam",
    hint: "Unwanted ads or repeated unrelated messages",
  },
  {
    value: "OTHER",
    label: "Something else",
    hint: "Anything else that breaks the rules",
  },
];

export const categoryLabel = (c: ReportCategory) =>
  REPORT_OPTIONS.find((o) => o.value === c)?.label ?? c;
export const categoryTone = (c: ReportCategory): BadgeTone =>
  c === "SPAM" || c === "OTHER" ? "neutral" : "danger";
