import createClient from "openapi-react-query";
import { client } from "./api";

export const $api = createClient(client);
