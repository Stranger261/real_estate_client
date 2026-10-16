import { paths } from "./api";

type ListingsBody =
  paths["/v1/listings"]["get"]["responses"][200]["content"]["application/json"];

export type ListingSummary = ListingsBody["data"]["listings"][number];
