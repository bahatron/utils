import { TSchema, Static } from "@sinclair/typebox";
import jsonschema, { Schema } from "jsonschema";
import { ValidationFailed } from "../error";

interface JsonSchemaError {
    path: (string | number)[];
    error: string;
    type: string;
}
const validator = new jsonschema.Validator();

/**
 * @description Returns the object if it's valid, Throws an exception if there are validation errors
 */
export function validate<T extends TSchema>(val: any, schema: T): Static<T> {
    let result = validator.validate(val, schema);

    if (!result.errors.length) return val;

    let errors = result.errors.map((err) => {
        return {
            path: err.path,
            error: err.message,
            type: err.name,
        };
    });

    throw ValidationFailed(errors, "JsonSchema Validation Failed");
}
