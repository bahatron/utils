import {
    TSchema,
    ExtendedTypeBuilder,
    Type,
    TUnion,
    TNull,
    TUnsafe,
} from "@sinclair/typebox";
import { validate } from "./validator";

function StringEnum<T extends string[] | readonly string[]>(
    values: [...T],
): TUnsafe<T[number]> {
    return Type.Unsafe<T[number]>({ type: "string", enum: values });
}

function Nullable<T extends TSchema>(type: T): TUnion<[T, TNull]> {
    return Type.Union([type, Type.Null()]);
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

    return extended as typeof extension & ExtendedTypeBuilder;
}

export const Schema = ExtendedTypeBox();
