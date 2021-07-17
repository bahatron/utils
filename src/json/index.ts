// export { default as stringify } from "fast-safe-stringify";
import fastSafeStringify from "fast-safe-stringify";

export function stringify(
    value: any,
    replacer: ((key: string, value: any) => any) | null = null,
    spaces?: number
): string {
    return fastSafeStringify(value, replacer ?? undefined, spaces);
}

/**
 * Unlike the default JSON.parse, parse will return undefined instead of throwing an error
 */
export function parse<T = any>(payload: any): T | T[] | undefined {
    try {
        return typeof payload === "string" ? JSON.parse(payload) : payload;
    } catch (err) {
        return undefined;
    }
}
