import {
    Static,
    TObject,
    TProperties,
    TSchema,
    TSchemaOptions,
    TStringOptions,
    TUnsafe,
    Type,
} from "typebox";
import { validate } from "./validator";

export type TNullable<T extends TSchema> = TUnsafe<Static<T> | null> &
    Omit<T, "~kind" | "~hint">;

type ExtractProperties<T> =
    T extends TObject<infer P>
        ? P
        : T extends { properties: infer P extends TProperties }
          ? P
          : {};

type MergeAll<T extends TSchema[]> = T extends [
    infer F extends TSchema,
    ...infer R extends TSchema[],
]
    ? ExtractProperties<F> & MergeAll<R>
    : {};

function StringEnum<T extends readonly string[]>(
    values: T,
    options?: TStringOptions,
): TUnsafe<T[number]> {
    return Type.Unsafe<T[number]>({
        type: "string",
        enum: values,
        ...options,
    });
}

function Nullable<T extends TSchema>(schema: T): TNullable<T> {
    return Object.setPrototypeOf(
        {
            ...schema,
            type: [(schema as any).type, "null"],
        },
        schema,
    ) as TNullable<T>;
}

function Email(options?: TStringOptions) {
    return Type.String({ format: "email", ...options });
}

function Date(options?: TSchemaOptions) {
    return Type.Refine(
        Type.Unsafe<Date>(options ?? {}),
        (value) => value instanceof Date,
        "Expected a Date or ISO date-time string",
    );
}

function DateExtended(options?: TSchemaOptions) {
    return Type.Union([
        Date(options),
        Type.String({ format: "date-time", ...options }),
        Type.String({ format: "date", ...options }),
    ]);
}

function Composite<T extends TSchema[]>(
    schemas: [...T],
    options?: TSchemaOptions,
): TObject<MergeAll<T>> {
    return Type.Interface(schemas, {}, options) as any;
}

function ExtendedTypeBox() {
    let extension = {
        validate,
        StringEnum,
        Nullable,
        Email,
        Date,
        DateExtended,
        Composite,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended as typeof extension & typeof Type;
}

export const Schema = ExtendedTypeBox();
