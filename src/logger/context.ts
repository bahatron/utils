export function LogContext(payload: any) {
    let weakSet = new WeakSet();
    function recursiveReduce(payload: any): any {
        if (payload?.isAxiosError) {
            return {
                req: {
                    headers: payload.config?.headers,
                    url: payload.config?.url,
                    method: payload.config?.method,
                    params: payload.config?.params,
                    data: payload.config?.data,
                },
                res: {
                    status: payload.response?.status,
                    data: payload.response?.data,
                },
            };
        } else if (payload instanceof Error) {
            return {
                ...payload,
                stack: payload?.stack?.split(`\n`).map((entry) => entry.trim()),
            };
        } else if (Array.isArray(payload)) {
            return payload.map(recursiveReduce);
        } else if (["object"].includes(typeof payload) && Boolean(payload)) {
            if (weakSet.has(payload)) return `[Reference]`;

            weakSet.add(payload);
            return Object.entries(payload).reduce((aggregate, [key, value]) => {
                aggregate[key] = recursiveReduce(value);
                return aggregate;
            }, {} as Record<string | number, any>);
        } else if (typeof payload === "function") {
            return `[Function: ${(payload as Function).name}]`;
        } else {
            return payload;
        }
    }

    return recursiveReduce(payload);
}