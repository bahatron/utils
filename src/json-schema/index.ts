import {
    TSchema,
    Static,
    ExtendedTypeBuilder,
    Type,
    TUnion,
    TNull,
    TUnsafe,
} from "@sinclair/typebox";
import jsonschema from "jsonschema";
export { TSchema, Static, JsonSchemaError };

const validator = new jsonschema.Validator();

interface JsonSchemaError {
    location: (string | number)[];
    error: string;
    type: string;
}

function validate(val: any, schema: TSchema): JsonSchemaError[] {
    let result = validator.validate(val, schema);

    console.log(result.errors);

    if (!result.errors.length) return [];

    return result.errors.map((err) => {
        return {
            location: err.path,
            error: err.message,
            type: err.name,
        };
    });
}

function StringEnum<T extends string[]>(values: [...T]): TUnsafe<T[number]> {
    return Type.Unsafe<T[number]>({ type: "string", enum: values });
}

function Nullable<T extends TSchema>(type: T): TUnion<[T, TNull]> {
    return Type.Union([type, Type.Null()]);
}

function ExtendedTypeBox(): ExtendedTypeBuilder & {
    StringEnum: typeof StringEnum;
    Nullable: typeof Nullable;
    validate: typeof validate;
} {
    let extension = {
        StringEnum,
        Nullable,
        validate,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended;
}

export const Schema = ExtendedTypeBox();
