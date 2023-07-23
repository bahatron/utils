import { TSchema } from "./schema";
import jsonschema from "jsonschema";

const validator = new jsonschema.Validator();

interface ValidationError {
    location: (string | number)[];
    error: string;
    type: string;
}

export function validate(val: any, schema: TSchema): ValidationError[] {
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
