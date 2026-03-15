import { PreconditionFailed } from "../error";
import type { TSchema, Static, Simplify, BaseOpts } from "./common";

type ObjectOptions = BaseOpts & {
    additionalProperties?: boolean;
};

type NullifyValues<T> = { [K in keyof T]: T[K] | null };

type MergeSchemaEntry<S> =
    null extends Static<S>
        ? NullifyValues<Exclude<Static<S>, null>>
        : Static<S>;

type MergeSchemas<T extends readonly any[]> = T extends readonly [
    infer First,
    ...infer Rest,
]
    ? MergeSchemaEntry<First> & MergeSchemas<Rest>
    : {};

/**
 * @description Merges multiple object schemas into a single object schema. All schemas in
 * the array must be of type "object" — a runtime error is thrown otherwise. Properties from
 * all schemas are combined into one flat object. If a source schema is nullable, its
 * properties become nullable (`T | null`) in the merged result since the source object
 * could be null. Use `Schema.Nullable`, `Schema.Optional`, and `Schema.Required` wrappers
 * to control the merged schema itself.
 *
 * @example
 * ```ts
 * let user = Schema.Object({ name: Schema.String() });
 * let profile = Schema.Object({ bio: Schema.Optional(Schema.String()) });
 * let full = Schema.Composite([user, profile]);
 * // { name: string; bio?: string }
 *
 * let address = Schema.Nullable(Schema.Object({ city: Schema.String() }));
 * let merged = Schema.Composite([user, address]);
 * // { name: string; city: string | null }
 * ```
 */
export function Composite<const T extends readonly TSchema<any>[]>(
    schemas: [...T],
    options?: ObjectOptions,
): TSchema<Simplify<MergeSchemas<T>>> {
    let mergedProperties: any = {};
    let mergedRequired: string[] = [];

    for (let schema of schemas) {
        let s = schema as any;
        let type = s.type;
        let isObject =
            type === "object" ||
            (globalThis.Array.isArray(type) && type.includes("object"));

        if (!isObject) {
            throw PreconditionFailed(
                "Schema.Composite: all schemas must be of type 'object'",
            );
        }

        let props = s.properties ?? {};
        let required: string[] = s.required ?? [];
        let isNullable =
            globalThis.Array.isArray(type) && type.includes("null");

        for (let key of globalThis.Object.keys(props)) {
            if (isNullable) {
                let prop = props[key];
                let propType = prop?.type;
                if (propType) {
                    let types = globalThis.Array.isArray(propType)
                        ? propType
                        : [propType];
                    if (!types.includes("null")) types = [...types, "null"];
                    mergedProperties[key] = { ...prop, type: types };
                } else {
                    mergedProperties[key] = prop;
                }
            } else {
                mergedProperties[key] = props[key];
            }
        }

        mergedRequired.push(...required);
    }

    let uniqueRequired = [...new globalThis.Set(mergedRequired)];
    let { additionalProperties, ...rest } = options ?? ({} as any);

    return {
        ...rest,
        type: "object",
        properties: mergedProperties,
        ...(uniqueRequired.length ? { required: uniqueRequired } : {}),
        ...(additionalProperties !== undefined ? { additionalProperties } : {}),
    } as any;
}
