import {
    Static,
    TEvaluate,
    TIntersect,
    TSchema,
    TSchemaOptions,
    TStringOptions,
    TUnsafe,
    Type,
} from "typebox";
import { validate } from "./validator";

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

function Nullable<T extends TSchema>(schema: T) {
    return Type.Unsafe<Static<T> | null>({
        ...schema,
        type: [(schema as any).type, "null"],
    });
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

// the return type hint is necessary, which is not too cool
function CompositeV1<T extends TSchema[]>(
    schemas: [...T],
    options?: TSchemaOptions,
): TEvaluate<TIntersect<T>> {
    return Type.Evaluate(Type.Intersect(schemas), options);
}

function Composite<T extends TSchema[]>(
    schemas: [...T],
    options?: TSchemaOptions,
) {
    return Type.Interface(schemas, {}, options);
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
