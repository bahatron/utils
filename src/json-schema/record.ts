import type { TSchema, Static, BaseOpts } from "./common";

type RecordOptions = BaseOpts;

type RecordKeySchema = TSchema<string> | TSchema<number>;

type ResolveRecordKey<K extends RecordKeySchema> =
    K extends TSchema<infer KT> ? KT : string;

let RECORD_KEY_PATTERNS = {
    string: "^.*$",
    number: "^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?$",
} as const;

/**
 * @description Creates a JSON Schema for a record / dictionary type. The key schema must
 * be either `Schema.String()` or `Schema.Number()`. The output always uses
 * `patternProperties` with the appropriate regex pattern for the key type.
 *
 * @example
 * ```ts
 * // Record<string, number> — patternProperties: { "^.*$": { type: "number" } }
 * Schema.Record(Schema.String(), Schema.Number())
 *
 * // Record<number, string> — patternProperties: { "^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?$": { type: "string" } }
 * Schema.Record(Schema.Number(), Schema.String())
 * ```
 */
export function Record<K extends RecordKeySchema, V extends TSchema<any>>(
    keySchema: K,
    valueSchema: V,
    options?: RecordOptions,
): TSchema<globalThis.Record<ResolveRecordKey<K>, Static<V>>> {
    let k = keySchema as any;
    let pattern =
        RECORD_KEY_PATTERNS[k.type as keyof typeof RECORD_KEY_PATTERNS];
    if (!pattern) {
        throw new Error(
            "Schema.Record: key schema must be Schema.String() or Schema.Number()",
        );
    }
    return {
        ...(options ?? {}),
        type: "object",
        patternProperties: { [pattern]: valueSchema },
    } as any;
}
