import jsonschema, { Schema } from "jsonschema";

const validator = new jsonschema.Validator();

export function json(val: any, schema: Schema): string[] {
    let result = validator.validate(val, schema);

    return result.errors.map((err) => err.toString());
}

export function boolean(val: any, message?: string): boolean {
    if (typeof val !== "boolean") {
        throw new Error(
            message || `validation failed - not valid boolean: ${val}`
        );
    }
    return val;
}

export function string(val: any, message?: string): string {
    if (typeof val !== "string") {
        throw new Error(
            message || `validation failed - not valid string: ${val}`
        );
    }
    return val;
}

export function optionalString(val: any): string | undefined {
    return val && typeof val === "string" ? val : undefined;
}

export function int(val: any, message?: string): number {
    if (isNaN(parseInt(val))) {
        throw new Error(message || `validation failed - not a number: ${val}`);
    }

    return parseInt(val);
}

export function optionalInt(val: any): number | undefined {
    let parsed = parseInt(val);

    if (isNaN(parsed)) {
        return undefined;
    }

    return parsed;
}

export function float(val: any, message?: string): number {
    let parsed = parseFloat(val);

    if (isNaN(parsed)) {
        throw new Error(message || `validation failed - not a number: ${val}`);
    }

    return parsed;
}

export function optionalFloat(val: any): number | undefined {
    let parsed = parseFloat(val);

    if (isNaN(parsed)) {
        return undefined;
    }

    return parsed;
}
