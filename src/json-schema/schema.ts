import { TSchema, Type, Static } from "@sinclair/typebox";

export { TSchema, Static };

function StringEnum<T extends string[]>(values: [...T]) {
    return Type.Unsafe<T[number]>({ type: "string", enum: values });
}

function Nullable<T extends TSchema>(type: T) {
    return Type.Union([type, Type.Null()]);
}

function ExtendedTypeBox() {
    let extension = {
        StringEnum,
        Nullable,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended as typeof Type & typeof extension;
}

export const Schema = ExtendedTypeBox();
