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

export function nullableInt(val: any): number | null {
    let parsed = parseInt(val);

    if (isNaN(parsed)) {
        return null;
    }

    return parsed;
}
