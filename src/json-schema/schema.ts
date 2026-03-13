import { type Schema as JsonSchemaDefinition } from "jsonschema";
import { validate } from "./validator";

// ─── Branded Schema Type ─────────────────────────────────────────────────────

declare const phantom: unique symbol;
declare const optionalBrand: unique symbol;

export type TSchema<T = unknown> = JsonSchemaDefinition & {
    readonly [phantom]: T;
};

export type TOptionalSchema<T = unknown> = TSchema<T> & {
    readonly [optionalBrand]: true;
};

export type Static<T> =
    T extends TOptionalSchema<infer U>
        ? U
        : T extends TSchema<infer U>
          ? U
          : never;

// ─── Shared Options ──────────────────────────────────────────────────────────

type NullableOpt = { nullable?: boolean };
type OptionalOpt = { optional?: boolean };
type BaseOpts = NullableOpt & OptionalOpt;

type ResolveNullable<Base, Opts extends NullableOpt> = Opts extends {
    nullable: true;
}
    ? Base | null
    : Base;

type ResolveOptional<T, Opts> = Opts extends { optional: true }
    ? TOptionalSchema<T>
    : TSchema<T>;

// ─── String ──────────────────────────────────────────────────────────────────

type StringOptions = BaseOpts & {
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
): ResolveOptional<ResolveString<Opts extends undefined ? {} : Opts>, Opts> {
    let {
        nullable,
        optional,
        enum: enumValues,
        ...rest
    } = options ?? ({} as any);
    let schema: any = {
        ...rest,
        type: nullable ? ["string", "null"] : "string",
        ...(enumValues ? { enum: enumValues } : {}),
    };
    if (optional) schema._optional = true;
    return schema;
}

// ─── Number ──────────────────────────────────────────────────────────────────

type NumberOptions = BaseOpts & {
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
): ResolveOptional<ResolveNumber<Opts extends undefined ? {} : Opts>, Opts> {
    let {
        nullable,
        optional,
        enum: enumValues,
        ...rest
    } = options ?? ({} as any);
    let schema: any = {
        ...rest,
        type: nullable ? ["number", "null"] : "number",
        ...(enumValues ? { enum: enumValues } : {}),
    };
    if (optional) schema._optional = true;
    return schema;
}

// ─── Boolean ─────────────────────────────────────────────────────────────────

type BooleanOptions = BaseOpts & {
    description?: string;
    default?: boolean;
};

type ResolveBoolean<Opts extends NullableOpt> = ResolveNullable<boolean, Opts>;

function Boolean<const Opts extends BooleanOptions = BooleanOptions>(
    options?: Opts,
): ResolveOptional<ResolveBoolean<Opts>, Opts> {
    let { nullable, optional, ...rest } = options ?? ({} as any);
    let schema: any = {
        ...rest,
        type: nullable ? ["boolean", "null"] : "boolean",
    };
    if (optional) schema._optional = true;
    return schema;
}

// ─── Array ───────────────────────────────────────────────────────────────────

type ArrayOptions = BaseOpts & {
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
): ResolveOptional<ResolveArray<T, Opts>, Opts> {
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

type ObjectOptions = NullableOpt & {
    additionalProperties?: boolean;
    description?: string;
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

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type ResolveObject<
    P extends PropertySchemas,
    Opts extends NullableOpt,
> = ResolveNullable<Simplify<ResolveObjectProperties<P>>, Opts>;

function Object<
    P extends PropertySchemas,
    const Opts extends ObjectOptions = ObjectOptions,
>(properties: P, options?: Opts): TSchema<ResolveObject<P, Opts>> {
    let { nullable, additionalProperties, ...rest } = options ?? ({} as any);
    let allKeys = globalThis.Object.keys(properties);
    let required = allKeys.filter((k) => !(properties[k] as any)?._optional);

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
