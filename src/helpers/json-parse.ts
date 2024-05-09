/**
 * @description Unlike the default JSON.parse, parse will return undefined instead of throwing an error
 */
export function jsonParse<T = any>(payload: any): T | T[] | undefined {
    try {
        return typeof payload === "string" ? JSON.parse(payload) : payload;
    } catch (err) {
        return undefined;
    }
}

/**
 * @deprecated use jsonParse
 */
export { jsonParse as parse };
