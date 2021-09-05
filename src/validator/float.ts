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

export function nullableFloat(val: any): number | null {
    let parsed = parseFloat(val);

    if (isNaN(parsed)) {
        return null;
    }

    return parsed;
}
