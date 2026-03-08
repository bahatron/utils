import { TSchema as BaseTSchema } from "typebox";
export interface TSchema extends BaseTSchema {
    type: string | string[];
}

export { type Schema as JsonSchema } from "jsonschema";
export type * from "typebox";
export * from "./schema";
