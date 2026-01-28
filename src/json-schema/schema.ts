import {
    TSchema,
    Type,
    TUnsafe,
    JavaScriptTypeBuilder,
    Static,
} from "@sinclair/typebox";
import { validate } from "./validator";

function StringEnum<T extends readonly string[]>(
    values: T,
): TUnsafe<T[number]> {
    return Type.Unsafe<T[number]>({ type: "string", enum: values });
}

function Nullable<T extends TSchema>(schema: T): TUnsafe<Static<T> | null> {
    return Type.Unsafe<Static<T> | null>({
        ...schema,
        type: [schema.type, "null"],
    });
}

function Email() {
    return Type.String({ format: "email" });
}

function DateExtended() {
    return Type.Union([Type.String({ format: "date-time" }), Type.Date()]);
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
