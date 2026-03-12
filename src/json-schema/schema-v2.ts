import { type Schema as JsonSchemaDefinition } from "jsonschema";
import { validate } from "./validator";

// ─── Branded Schema Type ─────────────────────────────────────────────────────

declare const phantom: unique symbol;

export type TSchema<T = unknown> = JsonSchemaDefinition & {
    readonly [phantom]: T;
};

export type Static<T> = T extends TSchema<infer U> ? U : never;

// ─── Shared Options ──────────────────────────────────────────────────────────

type NullableOpt = { nullable?: boolean };

type ResolveNullable<Base, Opts extends NullableOpt> = Opts extends {
    nullable: true;
}
    ? Base | null
    : Base;

// ─── String ──────────────────────────────────────────────────────────────────

type StringOptions = NullableOpt & {
    enum?: readonly string[];
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    description?: string;
    default?: string;
};

type ResolveString<Opts extends StringOptions> = ResolveNullable<
    Opts extends { enum: readonly (infer V)[] } ? V : string,
    Opts
>;

function String<const Opts extends StringOptions>(
    options?: Opts,
): TSchema<ResolveString<Opts extends undefined ? {} : Opts>> {
    let { nullable, enum: enumValues, ...rest } = options ?? ({} as any);
    return {
        ...rest,
        type: nullable ? ["string", "null"] : "string",
        ...(enumValues ? { enum: enumValues } : {}),
    } as any;
}

// ─── Number ──────────────────────────────────────────────────────────────────

type NumberOptions = NullableOpt & {
    enum?: readonly number[];
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number | boolean;
    exclusiveMaximum?: number | boolean;
    multipleOf?: number;
    description?: string;
    default?: number;
};

type ResolveNumber<Opts extends NumberOptions> = ResolveNullable<
    Opts extends { enum: readonly (infer V)[] } ? V : number,
    Opts
>;

function Number<const Opts extends NumberOptions>(
    options?: Opts,
): TSchema<ResolveNumber<Opts extends undefined ? {} : Opts>> {
    let { nullable, enum: enumValues, ...rest } = options ?? ({} as any);
    return {
        ...rest,
        type: nullable ? ["number", "null"] : "number",
        ...(enumValues ? { enum: enumValues } : {}),
    } as any;
}

// ─── Boolean ─────────────────────────────────────────────────────────────────

type BooleanOptions = NullableOpt & {
    description?: string;
    default?: boolean;
};

type ResolveBoolean<Opts extends NullableOpt> = ResolveNullable<boolean, Opts>;

function Boolean<const Opts extends BooleanOptions = BooleanOptions>(
    options?: Opts,
): TSchema<ResolveBoolean<Opts>> {
    let { nullable, ...rest } = options ?? ({} as any);
    return {
        ...rest,
        type: nullable ? ["boolean", "null"] : "boolean",
    } as any;
}

// ─── Array ───────────────────────────────────────────────────────────────────

type ArrayOptions = NullableOpt & {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    description?: string;
};

type ResolveArray<Item, Opts extends NullableOpt> = ResolveNullable<
    Item[],
    Opts
>;

function Array<T, const Opts extends ArrayOptions = ArrayOptions>(
    items: TSchema<T>,
    options?: Opts,
): TSchema<ResolveArray<T, Opts>> {
    let { nullable, ...rest } = options ?? ({} as any);
    return {
        ...rest,
        type: nullable ? ["array", "null"] : "array",
        items,
    } as any;
}

// ─── Object ──────────────────────────────────────────────────────────────────

type PropertySchemas = Record<string, TSchema<any>>;

type ObjectOptions<K extends string = string> = NullableOpt & {
    optional?: K[];
    additionalProperties?: boolean;
    description?: string;
};

type ResolveObjectProperties<
    P extends PropertySchemas,
    OptKeys extends string,
> = { [K in keyof P as K extends OptKeys ? never : K]: Static<P[K]> } & {
    [K in keyof P as K extends OptKeys ? K : never]?: Static<P[K]>;
};

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ResolveObject<
    P extends PropertySchemas,
    OptKeys extends string,
    Opts extends NullableOpt,
> = ResolveNullable<Simplify<ResolveObjectProperties<P, OptKeys>>, Opts>;

function Object<
    P extends PropertySchemas,
    const OptKeys extends (keyof P & string)[] = [],
    const Opts extends ObjectOptions<keyof P & string> = ObjectOptions<
        keyof P & string
    >,
>(
    properties: P,
    options?: Opts & { optional?: OptKeys },
): TSchema<ResolveObject<P, OptKeys[number], Opts>> {
    let { nullable, optional, additionalProperties, ...rest } =
        options ?? ({} as any);
    let allKeys = globalThis.Object.keys(properties);
    let optionalSet = new Set<string>(optional ?? []);
    let required = allKeys.filter((k) => !optionalSet.has(k));

    return {
        ...rest,
        type: nullable ? ["object", "null"] : "object",
        properties,
        ...(required.length ? { required } : {}),
        ...(additionalProperties !== undefined ? { additionalProperties } : {}),
    } as any;
}

// ─── Schema Export ───────────────────────────────────────────────────────────

export { String, Number, Boolean, Array, Object, validate };
