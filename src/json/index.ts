export function stringify(val: any): string {
    return ["object"].includes(typeof val) || Array.isArray(val)
        ? JSON.stringify(val)
        : val?.toString();
}

export function parse(payload: any): object | any[] | undefined {
    try {
        return JSON.parse(payload);
    } catch (err) {
        return undefined;
    }
}
