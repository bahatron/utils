export function boolean(val: any, message?: string): boolean {
    if (typeof val !== "boolean") {
        throw new Error(
            message || `validation failed - not valid boolean: ${val}`
        );
    }
    return val;
}
