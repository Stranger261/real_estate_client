import { BadgeTone } from "./offer";

export const TONE: Record<BadgeTone, { box: string; text: string }> = {
  primary: { box: "bg-primary-100", text: "text-primary-300" },
  success: { box: "bg-[#E6F6EC]", text: "text-[#1E8E4E]" },
  danger: { box: "bg-danger/10", text: "text-danger" },
  neutral: { box: "bg-primary-100", text: "text-black-200" },
};
