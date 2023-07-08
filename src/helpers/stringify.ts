import fastSafeStringify from "fast-safe-stringify";

/**
 * @deprecated use stringifyJson instead
 */
export function stringify(
    value: any,
    replacer: ((key: string, value: any) => any) | null | undefined = null,
    spaces?: number,
): string {
    return typeof value === "string"
        ? value
        : fastSafeStringify(value, replacer ?? undefined, spaces);
}

// interface migration
export const stringifyJson = stringify;
