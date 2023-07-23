import { TSchema, Type } from "@sinclair/typebox";
export { Static } from "@sinclair/typebox";
import jsonschema from "jsonschema";
const validator = new jsonschema.Validator();

interface ValidationError {
    location: (string | number)[];
    error: string;
    type: string;
}

function StringEnum<T extends string[]>(values: [...T]) {
    return Type.Unsafe<T[number]>({ type: "string", enum: values });
}

function Nullable<T extends TSchema>(type: T) {
    return Type.Union([type, Type.Null()]);
}

function validate(val: any, schema: TSchema): ValidationError[] {
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

function ExtendedTypeBox() {
    let extension = {
        StringEnum,
        Nullable,
        validate,
    };

    let extended = Object.setPrototypeOf(extension, Type);

    return extended as typeof Type & typeof extension;
}

export const JsonSchema = ExtendedTypeBox();
