import jsonschema, { Schema } from "jsonschema";

const validator = new jsonschema.Validator();

export function json(val: any, schema: Schema): string[] {
    let result = validator.validate(val, schema);

    return result.errors.map((err) => err.toString());
}
