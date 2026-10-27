import { components, paths } from "./api";

export type MediaScope = NonNullable<
  paths["/v1/media"]["get"]["parameters"]["query"]
>;
export type MediaPhoto = components["schemas"]["MediaPhoto"];

const MODES: MediaScope["mode"][] = ["property", "building", "unit", "room"];

export const isMediaMode = (value: unknown): value is MediaScope["mode"] =>
  MODES.includes(value as MediaScope["mode"]);
