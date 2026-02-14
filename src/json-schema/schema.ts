import {
    TSchema,
    Type,
    type TUnsafe,
    type JavaScriptTypeBuilder,
    type Static,
    type SchemaOptions,
    StringOptions,
} from "@sinclair/typebox";
import { validate } from "./validator";

function StringEnum<T extends readonly string[]>(
    values: T,
    options?: SchemaOptions,
): TUnsafe<T[number]> {
    return Type.Unsafe<T[number]>({
        type: "string",
        enum: values,
        ...options,
    });
}

function Nullable<T extends TSchema>(schema: T): TUnsafe<Static<T> | null> {
    return Type.Unsafe<Static<T> | null>({
        ...schema,
        type: [schema.type, "null"],
    });
}

function Email(options?: StringOptions) {
    return Type.String({ ...options, format: "email" });
}

function DateExtended(options?: SchemaOptions) {
    return Type.Union(
        [Type.String({ format: "date-time" }), Type.Date()],
        options,
    );
}

function ExtendedTypeBox() {
    let extension = {
        validate,
        StringEnum,
        Nullable,
        Email,
        DateExtended,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended as typeof extension & JavaScriptTypeBuilder;
}

export const Schema = ExtendedTypeBox();
