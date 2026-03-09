export { type Schema as JsonSchema } from "jsonschema";
import { TSchema as BaseTSchema } from "typebox";
export type TSchema = BaseTSchema & { type?: string | string[] };
export type * from "typebox";
export * from "./schema";
