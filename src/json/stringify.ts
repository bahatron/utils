import fastSafeStringify from "fast-safe-stringify";

export function stringify(
    value: any,
    replacer: ((key: string, value: any) => any) | null | undefined = null,
    spaces?: number
): string {
    return typeof value === "string"
        ? value
        : fastSafeStringify(value, replacer ?? undefined, spaces);
}
