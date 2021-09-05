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

export function nullableString(val: any): string | null {
    return val && typeof val === "string" ? val : null;
}
