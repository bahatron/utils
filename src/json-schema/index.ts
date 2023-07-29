import {
    TSchema,
    Static,
    ExtendedTypeBuilder,
    Type,
    TUnion,
    TNull,
    TUnsafe,
} from "@sinclair/typebox";
import { validate } from "./validator";
export { TSchema as JsonSchema };

function StringEnum<T extends string[]>(values: [...T]): TUnsafe<T[number]> {
    return Type.Unsafe<T[number]>({ type: "string", enum: values });
}

function Nullable<T extends TSchema>(type: T): TUnion<[T, TNull]> {
    return Type.Union([type, Type.Null()]);
}

function ExtendedTypeBox() {
    let extension = {
        validate,
        StringEnum,
        Nullable,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended as typeof extension & ExtendedTypeBuilder;
}

export const Schema = ExtendedTypeBox();
