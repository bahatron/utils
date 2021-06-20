export function stringify(value: any, replacer = null, space?: number): string {
    return ["object"].includes(typeof value) || Array.isArray(value)
        ? JSON.stringify(value, replacer, space)
        : value?.toString();
}

export function parse<T = any>(payload: any): T | T[] | undefined {
    try {
        return typeof payload === "string" ? JSON.parse(payload) : payload;
    } catch (err) {
        return undefined;
    }
}
