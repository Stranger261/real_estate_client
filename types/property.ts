import { components, paths } from "./api";

export type MyProperty = components["schemas"]["MyProperty"];
export type PropertyKind = MyProperty["type"];
export type CreatePropertyBody = NonNullable<
  paths["/v1/properties"]["post"]["requestBody"]
>["content"]["application/json"];
