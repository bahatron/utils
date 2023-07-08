/**
 * @description Unlike the default JSON.parse, parse will return undefined instead of throwing an error
 * @deprecated use parseJson
 */
export function parse<T = any>(payload: any): T | T[] | undefined {
    try {
        return typeof payload === "string" ? JSON.parse(payload) : payload;
    } catch (err) {
        return undefined;
    }
}

/**
 * @description Unlike the default JSON.parse, parse will return undefined instead of throwing an error
 */
export const parseJson = parse;
