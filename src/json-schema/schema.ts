import { type Schema as JsonSchema } from "jsonschema";
import { validate, addSchema } from "./validator";

// ─── Branded Schema Type ─────────────────────────────────────────────────────

declare const phantomBrand: unique symbol;
declare const optionalBrand: unique symbol;

export type TSchema<T = unknown> = JsonSchema & {
    readonly [phantomBrand]: T;
};

export type TOptionalSchema<T = unknown> = TSchema<T> & {
    readonly [optionalBrand]: true;
};

// ─── Raw JSON Schema Inference ───────────────────────────────────────────────

type JsonTypeMap = {
    string: string;
    number: number;
    integer: number;
    boolean: boolean;
};

type InferRawUnion<T extends readonly any[]> = T extends readonly [
    infer First,
    ...infer Rest,
]
    ? InferRawSchema<First> | InferRawUnion<Rest>
    : never;

type InferRawSchema<T> = T extends { readonly const: infer C }
    ? C
    : T extends { readonly enum: readonly (infer E)[] }
      ? E
      : T extends { readonly anyOf: infer A extends readonly any[] }
        ? InferRawUnion<A>
        : T extends { readonly oneOf: infer A extends readonly any[] }
          ? InferRawUnion<A>
          : T extends {
                  readonly type: readonly ["object", "null"];
                  readonly properties: infer P;
              }
            ? InferRawObjectProps<P, T> | null
            : T extends {
                    readonly type: readonly ["array", "null"];
                    readonly items: infer I;
                }
              ? InferRawSchema<I>[] | null
              : T extends {
                      readonly type: readonly [
                          infer Tp extends keyof JsonTypeMap,
                          "null",
                      ];
                  }
                ? JsonTypeMap[Tp] | null
                : T extends {
                        readonly type: "object";
                        readonly properties: infer P;
                    }
                  ? InferRawObjectProps<P, T>
                  : T extends { readonly type: "object" }
                    ? Record<string, unknown>
                    : T extends {
                            readonly type: "array";
                            readonly items: infer I;
                        }
                      ? InferRawSchema<I>[]
                      : T extends { readonly type: "array" }
                        ? unknown[]
                        : T extends {
                                readonly type: infer Tp extends
                                    keyof JsonTypeMap;
                            }
                          ? JsonTypeMap[Tp]
                          : unknown;

type InferRawObjectProps<P, T> = Simplify<
    T extends { readonly required: readonly (infer R extends string)[] }
        ? { [K in Extract<keyof P, R>]: InferRawSchema<P[K]> } & {
              [K in Exclude<keyof P & string, R>]?: InferRawSchema<P[K]>;
          }
        : { [K in keyof P]?: InferRawSchema<P[K]> }
>;

// ─── Static Type Extractor ───────────────────────────────────────────────────

export type Static<T> =
    T extends TOptionalSchema<infer U>
        ? U
        : T extends TSchema<infer U>
          ? U
          : InferRawSchema<T>;

// ─── Shared Options ──────────────────────────────────────────────────────────

type MetaOpts = {
    /** @description A unique URI identifier for this schema, used for `$ref` resolution. */
    $id?: string;
    /** @description Declares which JSON Schema draft this schema conforms to (e.g. `"http://json-schema.org/draft-07/schema#"`). Typically only set on the root schema. */
    $schema?: string;
};
type BaseOpts = MetaOpts & {
    description?: string;
    title?: string;
};

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ResolveEnum<Base, Opts> = Opts extends { enum: readonly (infer V)[] }
    ? V
    : Base;

// ─── Runtime Helpers ─────────────────────────────────────────────────────────

function buildPrimitiveSchema(typeName: string, options: any): any {
    let { enum: enumValues, ...rest } = options ?? ({} as any);
    return {
        ...rest,
        type: typeName,
        ...(enumValues ? { enum: enumValues } : {}),
    };
}

function buildUnionSchema(
    key: "anyOf" | "oneOf",
    schemas: any[],
    options: any,
): any {
    return { ...(options ?? {}), [key]: schemas };
}

// ─── Const ───────────────────────────────────────────────────────────────────

/**
 * @description Creates a JSON Schema `const` definition, restricting the value to an exact
 * literal. The TypeScript type is narrowed to the precise literal type of the provided value.
 *
 * @example
 * ```ts
 * Schema.Const("TR1")                          // "TR1"
 * Schema.Const(42)                             // 42
 * Schema.Const(true)                           // true
 * Schema.Const(null)                           // null
 * Schema.Const("v1", { description: "API version" })
 * ```
 */
function Const<const V>(value: V, options?: BaseOpts): TSchema<V> {
    return { ...(options ?? {}), const: value } as any;
}

// ─── String ──────────────────────────────────────────────────────────────────

type StringOptions = BaseOpts & {
    enum?: readonly string[];
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    default?: string;
};

/**
 * @description Creates a JSON Schema for a string type. Supports enum constraints to narrow
 * the type to specific literal values. Additional validation options include minLength,
 * maxLength, pattern (regex), and format (e.g. "email", "uri"). Use `Schema.Nullable`,
 * `Schema.Optional`, and `Schema.Required` wrappers to control nullability and optionality.
 *
 * @example
 * ```ts
 * Schema.String()                                      // string
 * Schema.Nullable(Schema.String())                      // string | null
 * Schema.String({ enum: ["a", "b"] as const })          // "a" | "b"
 * Schema.String({ minLength: 1, format: "email" })      // string (validated)
 * Schema.Optional(Schema.String())                      // marks as optional in parent object
 * ```
 */
function String<const Opts extends StringOptions>(
    options?: Opts,
): TSchema<ResolveEnum<string, Opts extends undefined ? {} : Opts>> {
    return buildPrimitiveSchema("string", options);
}

// ─── Number ──────────────────────────────────────────────────────────────────

type NumberOptions = BaseOpts & {
    enum?: readonly number[];
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number | boolean;
    exclusiveMaximum?: number | boolean;
    multipleOf?: number;
    default?: number;
};

/**
 * @description Creates a JSON Schema for a number type. Supports enum constraints to narrow
 * the type to specific literal numeric values. Additional validation options include
 * minimum, maximum, exclusiveMinimum, exclusiveMaximum, and multipleOf. Use `Schema.Nullable`,
 * `Schema.Optional`, and `Schema.Required` wrappers to control nullability and optionality.
 *
 * @example
 * ```ts
 * Schema.Number()                                      // number
 * Schema.Nullable(Schema.Number())                      // number | null
 * Schema.Number({ enum: [1, 2, 3] as const })           // 1 | 2 | 3
 * Schema.Number({ minimum: 0, maximum: 100 })           // number (validated)
 * Schema.Optional(Schema.Number())                      // marks as optional in parent object
 * ```
 */
function Number<const Opts extends NumberOptions>(
    options?: Opts,
): TSchema<ResolveEnum<number, Opts extends undefined ? {} : Opts>> {
    return buildPrimitiveSchema("number", options);
}

// ─── Boolean ─────────────────────────────────────────────────────────────────

type BooleanOptions = BaseOpts & {
    default?: boolean;
};

/**
 * @description Creates a JSON Schema for a boolean type. A default value and description
 * can be provided. Use `Schema.Nullable`, `Schema.Optional`, and `Schema.Required` wrappers
 * to control nullability and optionality.
 *
 * @example
 * ```ts
 * Schema.Boolean()                                     // boolean
 * Schema.Nullable(Schema.Boolean())                     // boolean | null
 * Schema.Boolean({ default: false, description: "active flag" })
 * ```
 */
function Boolean(options?: BooleanOptions): TSchema<boolean> {
    return buildPrimitiveSchema("boolean", options);
}

// ─── Array ───────────────────────────────────────────────────────────────────

type ArrayOptions = BaseOpts & {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
};

/**
 * @description Creates a JSON Schema for an array type. The first parameter defines the
 * schema for each item in the array. Validation options include minItems, maxItems, and
 * uniqueItems. Use `Schema.Nullable`, `Schema.Optional`, and `Schema.Required` wrappers
 * to control nullability and optionality.
 *
 * @example
 * ```ts
 * Schema.Array(Schema.String())                                // string[]
 * Schema.Nullable(Schema.Array(Schema.Number()))                // number[] | null
 * Schema.Array(Schema.Nullable(Schema.String()))                // (string | null)[]
 * Schema.Array(Schema.String(), { minItems: 1, uniqueItems: true })
 * ```
 */
function Array<T>(items: TSchema<T>, options?: ArrayOptions): TSchema<T[]> {
    return { ...(options ?? {}), type: "array", items } as any;
}

// ─── Object ──────────────────────────────────────────────────────────────────

type PropertySchemas = Record<string, TSchema<any> | TOptionalSchema<any>>;

type ObjectOptions = BaseOpts & {
    additionalProperties?: boolean;
};

type RequiredKeys<P extends PropertySchemas> = {
    [K in keyof P]: P[K] extends TOptionalSchema<any> ? never : K;
}[keyof P];

type OptionalKeys<P extends PropertySchemas> = {
    [K in keyof P]: P[K] extends TOptionalSchema<any> ? K : never;
}[keyof P];

type ResolveObjectProperties<P extends PropertySchemas> = {
    [K in RequiredKeys<P>]: Static<P[K]>;
} & {
    [K in OptionalKeys<P>]?: Static<P[K]>;
};

/**
 * @description Creates a JSON Schema for an object type. Properties are defined as a record
 * of key-schema pairs. Properties wrapped in `Schema.Optional()` become optional keys;
 * all others are required. Use `Schema.Nullable`, `Schema.Optional`, and `Schema.Required`
 * wrappers to control nullability and optionality of the object itself.
 *
 * @example
 * ```ts
 * Schema.Object({
 *     name: Schema.String(),
 *     bio: Schema.Optional(Schema.String()),
 * })
 * // { name: string; bio?: string }
 *
 * Schema.Nullable(Schema.Object({ id: Schema.Number() }))
 * // { id: number } | null
 * ```
 */
function Object<P extends PropertySchemas>(
    properties: P,
    options?: ObjectOptions,
): TSchema<Simplify<ResolveObjectProperties<P>>> {
    let { additionalProperties, ...rest } = options ?? ({} as any);
    let allKeys = globalThis.Object.keys(properties);
    let required = allKeys.filter((k) => !(properties[k] as any)?._optional);

    return {
        ...rest,
        type: "object",
        properties,
        ...(required.length ? { required } : {}),
        ...(additionalProperties !== undefined ? { additionalProperties } : {}),
    } as any;
}

// ─── Pick / Omit ─────────────────────────────────────────────────────────────

type ObjectTSchema = TSchema<Record<string, any>>;

function assertObjectSchema(schema: any, method: string): void {
    let type = schema.type;
    let isObject =
        type === "object" ||
        (globalThis.Array.isArray(type) && type.includes("object"));
    if (!isObject) {
        throw new Error(`Schema.${method}: schema must be of type 'object'`);
    }
}

function pickFromSchema(schema: any, keys: string[], method: string): any {
    assertObjectSchema(schema, method);
    let props = schema.properties ?? {};
    let required: string[] = schema.required ?? [];
    let picked: any = {};
    for (let key of keys) {
        picked[key] = props[key];
    }
    let newRequired = required.filter((k: string) => keys.includes(k));
    let { properties: _, required: __, ...rest } = schema;
    return {
        ...rest,
        properties: picked,
        ...(newRequired.length ? { required: newRequired } : {}),
    };
}

/**
 * @description Creates a new object schema containing only the specified keys from the
 * source schema. The source must be an object schema — a runtime error is thrown otherwise.
 * Keys are type-checked against the source schema's properties.
 *
 * @example
 * ```ts
 * let user = Schema.Object({ name: Schema.String(), age: Schema.Number(), email: Schema.String() });
 * let nameOnly = Schema.Pick(user, ["name"]);
 * // { name: string }
 *
 * Schema.Pick(user, ["foo"]); // type error: "foo" does not exist
 * ```
 */
function Pick<S extends ObjectTSchema, K extends (keyof Static<S> & string)[]>(
    schema: S,
    keys: [...K],
): TSchema<Simplify<globalThis.Pick<Static<S>, K[number]>>> {
    return pickFromSchema(schema, keys, "Pick");
}

/**
 * @description Creates a new object schema excluding the specified keys from the source
 * schema. The source must be an object schema — a runtime error is thrown otherwise.
 * Keys are type-checked against the source schema's properties.
 *
 * @example
 * ```ts
 * let user = Schema.Object({ name: Schema.String(), age: Schema.Number(), email: Schema.String() });
 * let withoutEmail = Schema.Omit(user, ["email"]);
 * // { name: string; age: number }
 *
 * Schema.Omit(user, ["foo"]); // type error: "foo" does not exist
 * ```
 */
function Omit<S extends ObjectTSchema, K extends (keyof Static<S> & string)[]>(
    schema: S,
    keys: [...K],
): TSchema<Simplify<globalThis.Omit<Static<S>, K[number]>>> {
    let allKeys = globalThis.Object.keys((schema as any).properties ?? {});
    let remaining = allKeys.filter((k) => !keys.includes(k as any));
    return pickFromSchema(schema, remaining, "Omit");
}

// ─── Composite ──────────────────────────────────────────────────────────────

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
function Composite<const T extends readonly TSchema<any>[]>(
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
            throw new Error(
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

// ─── AnyOf / OneOf ──────────────────────────────────────────────────────────

type UnionOptions = BaseOpts & {
    discriminator?: { propertyName: string };
};

type ResolveUnion<T extends readonly TSchema<any>[]> = T extends readonly [
    infer First extends TSchema<any>,
    ...infer Rest extends TSchema<any>[],
]
    ? Static<First> | ResolveUnion<Rest>
    : never;

/**
 * @description Creates a JSON Schema `anyOf` definition, representing a union type where
 * the value must match at least one of the provided schemas. At the TypeScript level this
 * produces a union of all schema types. Use `Schema.Nullable` and `Schema.Optional`
 * wrappers to control nullability and optionality.
 *
 * @example
 * ```ts
 * Schema.AnyOf([Schema.String(), Schema.Number()])              // string | number
 * Schema.Nullable(Schema.AnyOf([Schema.String(), Schema.Number()]))
 * // string | number | null
 * ```
 */
function AnyOf<const T extends readonly TSchema<any>[]>(
    schemas: [...T],
    options?: UnionOptions,
): TSchema<ResolveUnion<T>> {
    return buildUnionSchema("anyOf", schemas, options);
}

/**
 * @description Creates a JSON Schema `oneOf` definition, representing a union type where
 * the value must match exactly one of the provided schemas. At the TypeScript level this
 * produces the same union type as AnyOf, but at validation time it enforces that exactly
 * one schema matches (not multiple). Use `Schema.Nullable` and `Schema.Optional` wrappers
 * to control nullability and optionality.
 *
 * @example
 * ```ts
 * Schema.OneOf([Schema.String(), Schema.Number()])              // string | number
 * Schema.OneOf([
 *     Schema.String({ enum: ["active", "inactive"] as const }),
 *     Schema.Number({ enum: [0, 1] as const }),
 * ])
 * // "active" | "inactive" | 0 | 1
 * ```
 */
function OneOf<const T extends readonly TSchema<any>[]>(
    schemas: [...T],
    options?: UnionOptions,
): TSchema<ResolveUnion<T>> {
    return buildUnionSchema("oneOf", schemas, options);
}

// ─── Recursive ──────────────────────────────────────────────────────────────

/**
 * @description Creates a recursive (self-referencing) JSON Schema. The first parameter is
 * a `$id` URI that uniquely identifies this schema. The second parameter is a callback
 * that receives a `self` reference (a `$ref` placeholder) and must return the full schema
 * definition. The schema is automatically registered with the validator for `$ref` resolution.
 *
 * The type parameter `T` must be provided explicitly since TypeScript cannot infer
 * recursive types.
 *
 * @example
 * ```ts
 * type TreeNode = { value: string; children: TreeNode[] };
 *
 * const treeSchema = Schema.Recursive<TreeNode>("TreeNode", self =>
 *     Schema.Object({
 *         value: Schema.String(),
 *         children: Schema.Array(self),
 *     }),
 * );
 * ```
 */
function Recursive<T>(
    $id: string,
    callback: (self: TSchema<T>) => TSchema<T>,
): TSchema<T> {
    let self = { $ref: $id } as any as TSchema<T>;
    let schema = callback(self) as any;
    schema.$id = $id;
    addSchema(schema, $id);
    return schema as TSchema<T>;
}

// ─── Any ────────────────────────────────────────────────────────────────────

/**
 * @description Creates an empty JSON Schema `{}` that accepts any value. The TypeScript
 * type is `any`. Supports standard metadata options (`$id`, `$schema`, `title`,
 * `description`).
 *
 * @example
 * ```ts
 * Schema.Any()                                          // any
 * Schema.Any({ description: "arbitrary metadata" })
 * Schema.Any({ $id: "https://example.com/meta" })
 * ```
 */
function Any(options?: BaseOpts): TSchema<any> {
    return { ...(options ?? {}) } as any;
}

// ─── Record ─────────────────────────────────────────────────────────────────

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
function Record<K extends RecordKeySchema, V extends TSchema<any>>(
    keySchema: K,
    valueSchema: V,
    options?: RecordOptions,
): TSchema<globalThis.Record<ResolveRecordKey<K>, Static<V>>> {
    let k = keySchema as any;
    let pattern = RECORD_KEY_PATTERNS[k.type as keyof typeof RECORD_KEY_PATTERNS];
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

// ─── Nullable / Optional / Required ─────────────────────────────────────────

/**
 * @description Wraps any schema to allow `null` as a valid value. At the type level, the
 * phantom type becomes `T | null`. At the JSON Schema level, `"null"` is appended to the
 * `type` array (or to `anyOf`/`oneOf` for union schemas).
 *
 * @example
 * ```ts
 * Schema.Nullable(Schema.String())                      // string | null
 * Schema.Nullable(Schema.Number())                      // number | null
 * Schema.Nullable(Schema.Object({ id: Schema.Number() }))
 * // { id: number } | null
 * ```
 */
function Nullable<T>(schema: TOptionalSchema<T>): TOptionalSchema<T | null>;
function Nullable<T>(schema: TSchema<T>): TSchema<T | null>;
function Nullable(schema: any): any {
    let s = { ...schema };
    if (s.type) {
        let types = globalThis.Array.isArray(s.type) ? s.type : [s.type];
        if (!types.includes("null")) s.type = [...types, "null"];
    } else if (s.anyOf) {
        s.anyOf = [...s.anyOf, { type: "null" }];
    } else if (s.oneOf) {
        s.oneOf = [...s.oneOf, { type: "null" }];
    } else {
        s = { anyOf: [schema, { type: "null" }] };
        if (schema._optional) s._optional = true;
    }
    return s;
}

/**
 * @description Marks a schema as optional inside a `Schema.Object`. The wrapped property
 * will be excluded from the parent object's `required` array. The value type itself is
 * unchanged — `Schema.Optional(Schema.String())` is still `string`, because `undefined`
 * is not a valid JSON Schema value type. This wrapper is only meaningful as a direct
 * property value of `Schema.Object()`.
 *
 * @example
 * ```ts
 * Schema.Object({
 *     name: Schema.String(),                            // required
 *     bio: Schema.Optional(Schema.String()),             // optional, still string
 *     age: Schema.Optional(Schema.Nullable(Schema.Number())), // optional, number | null
 * })
 * // { name: string; bio?: string; age?: number | null }
 * ```
 */
function Optional<T>(schema: TSchema<T>): TOptionalSchema<T> {
    let s = { ...schema } as any;
    s._optional = true;
    return s;
}

/**
 * @description Strips both nullable and optional from a schema. Reverses the effects of
 * `Schema.Nullable` and `Schema.Optional`. At the type level, `null` is removed from the
 * type union and the schema is no longer marked optional.
 *
 * @example
 * ```ts
 * let nullable = Schema.Nullable(Schema.String());       // string | null
 * Schema.Required(nullable)                              // string
 *
 * let opt = Schema.Optional(Schema.Number());             // optional number
 * Schema.Required(opt)                                   // required number
 *
 * let both = Schema.Optional(Schema.Nullable(Schema.String()));
 * Schema.Required(both)                                  // required string
 * ```
 */
function Required<T>(
    schema: TSchema<T> | TOptionalSchema<T>,
): TSchema<NonNullable<T>> {
    let s = { ...schema } as any;
    delete s._optional;
    if (s.type) {
        if (globalThis.Array.isArray(s.type)) {
            let types = s.type.filter((t: string) => t !== "null");
            s.type = types.length === 1 ? types[0] : types;
        }
    } else if (s.anyOf) {
        s.anyOf = s.anyOf.filter(
            (item: any) =>
                !(
                    item.type === "null" &&
                    globalThis.Object.keys(item).length === 1
                ),
        );
    } else if (s.oneOf) {
        s.oneOf = s.oneOf.filter(
            (item: any) =>
                !(
                    item.type === "null" &&
                    globalThis.Object.keys(item).length === 1
                ),
        );
    }
    return s;
}

// ─── From (raw JSON Schema → branded TSchema) ──────────────────────────────

/**
 * @description Converts a plain JSON Schema object into a branded `TSchema<T>`, inferring
 * the TypeScript type from the schema structure. Uses a `const` generic parameter so
 * literal types are preserved without needing `as const` at the call site. This is useful
 * for working with schemas defined as plain objects or imported from JSON files.
 *
 * @example
 * ```ts
 * const schema = Schema.From({
 *     type: "object",
 *     properties: {
 *         name: { type: "string" },
 *         age: { type: "number" },
 *     },
 *     required: ["name", "age"],
 * });
 * type T = Static<typeof schema>; // { name: string; age: number }
 *
 * // Works with JSON imports:
 * import raw from "./schema.json";
 * const s = Schema.From(raw);
 * ```
 */
function From<const T>(schema: T): TSchema<InferRawSchema<T>> {
    return schema as any;
}

// ─── Schema Export ───────────────────────────────────────────────────────────

export {
    Any,
    Const,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Record,
    Pick,
    Omit,
    Composite,
    AnyOf,
    OneOf,
    Recursive,
    From,
    Nullable,
    Optional,
    Required,
    validate,
};
