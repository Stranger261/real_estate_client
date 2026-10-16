import { ListingSummary } from "@/types/listing";

export const getThumbnail = (l: ListingSummary): string | null =>
  l.property?.media?.[0]?.url ??
  l.unit?.media?.[0]?.url ??
  l.room?.media?.[0]?.url ??
  l.building?.media?.[0]?.url ??
  null;

export const formatPrice = (value: number) =>
  `₱${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
