export function stringify(value: any, replacer = null, space?: number): string {
    return ["object"].includes(typeof value) || Array.isArray(value)
        ? JSON.stringify(value, replacer, space)
        : value?.toString();
}

export function parse(payload: any): object | any[] | undefined {
    try {
        return JSON.parse(payload);
    } catch (err) {
        return undefined;
    }
}
