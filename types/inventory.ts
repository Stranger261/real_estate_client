import { components, paths } from "./api";

export type InventoryItem = components["schemas"]["InventoryItem"];
export type BuildingOption = components["schemas"]["BuildingOption"];

type JsonBody<
  T extends { requestBody?: { content: { "application/json": unknown } } },
> = NonNullable<T["requestBody"]>["content"]["application/json"];

export type CreateBuildingBody = JsonBody<paths["/v1/buildings"]["post"]>;
export type CreateUnitBody = JsonBody<paths["/v1/units"]["post"]>;
export type CreateRoomBody = JsonBody<paths["/v1/rooms"]["post"]>;
