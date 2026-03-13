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

type NullableOpt = { nullable?: boolean };
type OptionalOpt = { optional?: boolean };
type MetaOpts = {
    /** @description A unique URI identifier for this schema, used for `$ref` resolution. */
    $id?: string;
    /** @description Declares which JSON Schema draft this schema conforms to (e.g. `"http://json-schema.org/draft-07/schema#"`). Typically only set on the root schema. */
    $schema?: string;
};
type BaseOpts = NullableOpt &
    OptionalOpt &
    MetaOpts & {
        description?: string;
        title?: string;
    };

type ResolveNullable<Base, Opts extends NullableOpt> = Opts extends {
    nullable: true;
}
    ? Base | null
    : Base;

type ResolveOptional<T, Opts> = Opts extends { optional: true }
    ? TOptionalSchema<T>
    : TSchema<T>;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ResolveEnum<Base, Opts extends NullableOpt> = ResolveNullable<
    Opts extends { enum: readonly (infer V)[] } ? V : Base,
    Opts
>;

// ─── Runtime Helpers ─────────────────────────────────────────────────────────

function buildPrimitiveSchema(typeName: string, options: any): any {
    let {
        nullable,
        optional,
        enum: enumValues,
        ...rest
    } = options ?? ({} as any);
    let schema: any = {
        ...rest,
        type: nullable ? [typeName, "null"] : typeName,
        ...(enumValues ? { enum: enumValues } : {}),
    };
    if (optional) schema._optional = true;
    return schema;
}

function buildUnionSchema(
    key: "anyOf" | "oneOf",
    schemas: any[],
    options: any,
): any {
    let { nullable, optional, ...rest } = options ?? ({} as any);
    let schema: any = {
        ...rest,
        [key]: nullable ? [...schemas, { type: "null" }] : schemas,
    };
    if (optional) schema._optional = true;
    return schema;
}

// ─── Const ───────────────────────────────────────────────────────────────────

type ConstOptions = Omit<BaseOpts, "nullable">;

/**
 * @description Creates a JSON Schema `const` definition, restricting the value to an exact
 * literal. The TypeScript type is narrowed to the precise literal type of the provided value.
 * Supports optional to mark the property as non-required in a parent object.
 *
 * @example
 * ```ts
 * Schema.Const("TR1")                          // "TR1"
 * Schema.Const(42)                             // 42
 * Schema.Const(true)                           // true
 * Schema.Const(null)                           // null
 * Schema.Const("v1", { description: "API version", optional: true })
 * ```
 */
function Const<const V, const Opts extends ConstOptions = ConstOptions>(
    value: V,
    options?: Opts,
): ResolveOptional<V, Opts> {
    let { optional, ...rest } = options ?? ({} as any);
    let schema: any = { ...rest, const: value };
    if (optional) schema._optional = true;
    return schema;
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
 * the type to specific literal values, nullable to allow null, and optional to mark the
 * property as non-required when used inside an object schema. Additional validation options
 * include minLength, maxLength, pattern (regex), and format (e.g. "email", "uri").
 *
 * @example
 * ```ts
 * Schema.String()                                      // string
 * Schema.String({ nullable: true })                     // string | null
 * Schema.String({ enum: ["a", "b"] as const })          // "a" | "b"
 * Schema.String({ minLength: 1, format: "email" })      // string (validated)
 * Schema.String({ optional: true })                     // marks as optional in parent object
 * ```
 */
function String<const Opts extends StringOptions>(
    options?: Opts,
): ResolveOptional<
    ResolveEnum<string, Opts extends undefined ? {} : Opts>,
    Opts
> {
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
 * the type to specific literal numeric values, nullable to allow null, and optional to mark
 * the property as non-required in a parent object. Additional validation options include
 * minimum, maximum, exclusiveMinimum, exclusiveMaximum, and multipleOf.
 *
 * @example
 * ```ts
 * Schema.Number()                                      // number
 * Schema.Number({ nullable: true })                     // number | null
 * Schema.Number({ enum: [1, 2, 3] as const })           // 1 | 2 | 3
 * Schema.Number({ minimum: 0, maximum: 100 })           // number (validated)
 * Schema.Number({ optional: true })                     // marks as optional in parent object
 * ```
 */
function Number<const Opts extends NumberOptions>(
    options?: Opts,
): ResolveOptional<
    ResolveEnum<number, Opts extends undefined ? {} : Opts>,
    Opts
> {
    return buildPrimitiveSchema("number", options);
}

// ─── Boolean ─────────────────────────────────────────────────────────────────

type BooleanOptions = BaseOpts & {
    default?: boolean;
};

/**
 * @description Creates a JSON Schema for a boolean type. Supports nullable to allow null
 * and optional to mark the property as non-required in a parent object. A default value
 * and description can also be provided.
 *
 * @example
 * ```ts
 * Schema.Boolean()                                     // boolean
 * Schema.Boolean({ nullable: true })                    // boolean | null
 * Schema.Boolean({ default: false, description: "active flag" })
 * ```
 */
function Boolean<const Opts extends BooleanOptions = BooleanOptions>(
    options?: Opts,
): ResolveOptional<ResolveNullable<boolean, Opts>, Opts> {
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
 * schema for each item in the array. Supports nullable to allow null, optional to mark
 * the property as non-required in a parent object, and validation options like minItems,
 * maxItems, and uniqueItems.
 *
 * @example
 * ```ts
 * Schema.Array(Schema.String())                                // string[]
 * Schema.Array(Schema.Number(), { nullable: true })             // number[] | null
 * Schema.Array(Schema.String({ nullable: true }))               // (string | null)[]
 * Schema.Array(Schema.String(), { minItems: 1, uniqueItems: true })
 * ```
 */
function Array<T, const Opts extends ArrayOptions = ArrayOptions>(
    items: TSchema<T>,
    options?: Opts,
): ResolveOptional<ResolveNullable<T[], Opts>, Opts> {
    let { nullable, optional, ...rest } = options ?? ({} as any);
    let schema: any = {
        ...rest,
        type: nullable ? ["array", "null"] : "array",
        items,
    };
    if (optional) schema._optional = true;
    return schema;
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

type ResolveObject<
    P extends PropertySchemas,
    Opts extends NullableOpt,
> = ResolveNullable<Simplify<ResolveObjectProperties<P>>, Opts>;

/**
 * @description Creates a JSON Schema for an object type. Properties are defined as a record
 * of key-schema pairs. Properties created with `{ optional: true }` become optional keys;
 * all others are required. Supports nullable to allow null, optional to mark the property
 * as non-required in a parent object, additionalProperties to control extra keys, and
 * description for documentation.
 *
 * @example
 * ```ts
 * Schema.Object({
 *     name: Schema.String(),
 *     bio: Schema.String({ optional: true }),
 * })
 * // { name: string; bio?: string }
 *
 * Schema.Object({ id: Schema.Number() }, { nullable: true })
 * // { id: number } | null
 * ```
 */
function Object<
    P extends PropertySchemas,
    const Opts extends ObjectOptions = ObjectOptions,
>(
    properties: P,
    options?: Opts,
): ResolveOptional<ResolveObject<P, Opts>, Opts> {
    let { nullable, optional, additionalProperties, ...rest } =
        options ?? ({} as any);
    let allKeys = globalThis.Object.keys(properties);
    let required = allKeys.filter((k) => !(properties[k] as any)?._optional);

    let schema: any = {
        ...rest,
        type: nullable ? ["object", "null"] : "object",
        properties,
        ...(required.length ? { required } : {}),
        ...(additionalProperties !== undefined ? { additionalProperties } : {}),
    };
    if (optional) schema._optional = true;
    return schema;
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

type ResolveComposite<
    T extends readonly any[],
    Opts extends NullableOpt,
> = ResolveNullable<Simplify<MergeSchemas<T>>, Opts>;

/**
 * @description Merges multiple object schemas into a single object schema. All schemas in
 * the array must be of type "object" — a runtime error is thrown otherwise. Properties from
 * all schemas are combined into one flat object. If a source schema is nullable, its
 * properties become nullable (`T | null`) in the merged result since the source object
 * could be null. Supports the same options as Object (nullable, optional,
 * additionalProperties, description).
 *
 * @example
 * ```ts
 * let user = Schema.Object({ name: Schema.String() });
 * let profile = Schema.Object({ bio: Schema.String({ optional: true }) });
 * let full = Schema.Composite([user, profile]);
 * // { name: string; bio?: string }
 *
 * let address = Schema.Object({ city: Schema.String() }, { nullable: true });
 * let merged = Schema.Composite([user, address]);
 * // { name: string; city: string | null }
 * ```
 */
function Composite<
    const T extends readonly TSchema<any>[],
    const Opts extends ObjectOptions = ObjectOptions,
>(
    schemas: [...T],
    options?: Opts,
): ResolveOptional<ResolveComposite<T, Opts>, Opts> {
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
    let { nullable, optional, additionalProperties, ...rest } =
        options ?? ({} as any);

    let result: any = {
        ...rest,
        type: nullable ? ["object", "null"] : "object",
        properties: mergedProperties,
        ...(uniqueRequired.length ? { required: uniqueRequired } : {}),
        ...(additionalProperties !== undefined ? { additionalProperties } : {}),
    };
    if (optional) result._optional = true;
    return result;
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
 * produces a union of all schema types. Supports nullable (appends `{ type: "null" }` to
 * the anyOf array) and optional to mark as non-required in a parent object.
 *
 * @example
 * ```ts
 * Schema.AnyOf([Schema.String(), Schema.Number()])              // string | number
 * Schema.AnyOf([Schema.String(), Schema.Number()], { nullable: true })
 * // string | number | null
 * ```
 */
function AnyOf<
    const T extends readonly TSchema<any>[],
    const Opts extends UnionOptions = UnionOptions,
>(
    schemas: [...T],
    options?: Opts,
): ResolveOptional<ResolveNullable<ResolveUnion<T>, Opts>, Opts> {
    return buildUnionSchema("anyOf", schemas, options);
}

/**
 * @description Creates a JSON Schema `oneOf` definition, representing a union type where
 * the value must match exactly one of the provided schemas. At the TypeScript level this
 * produces the same union type as AnyOf, but at validation time it enforces that exactly
 * one schema matches (not multiple). Supports nullable and optional.
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
function OneOf<
    const T extends readonly TSchema<any>[],
    const Opts extends UnionOptions = UnionOptions,
>(
    schemas: [...T],
    options?: Opts,
): ResolveOptional<ResolveNullable<ResolveUnion<T>, Opts>, Opts> {
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
    Const,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Composite,
    AnyOf,
    OneOf,
    Recursive,
    From,
    validate,
};
