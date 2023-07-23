import { TSchema, Type, Static } from "@sinclair/typebox";
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
        validate,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended as typeof Type & typeof extension;
}

export const Schema = ExtendedTypeBox();
