export function LogContext(context: any) {
    let weakSet = new WeakSet();

    const recursiveReduce = (context: any): any => {
        if (context instanceof Error) {
            return {
                ...context,
                stack: context?.stack?.split(`\n`).map((entry) => entry.trim()),
            };
        } else if (typeof context === "bigint") {
            return Number(context);
        } else if (typeof context?.toISOString === "function") {
            return `[Date: ${context.toISOString()}]`;
        } else if (Array.isArray(context)) {
            return context.map(recursiveReduce);
        } else if (context?.isAxiosError) {
            return {
                req: {
                    headers: context.config?.headers,
                    method: context.config?.method,
                    url: context.config?.url,
                    params: context.config?.params,
                    data: context.config?.data,
                },
                res: {
                    status: context.response?.status,
                    data: context.response?.data,
                },
            };
        } else if (["object"].includes(typeof context) && Boolean(context)) {
            if (weakSet.has(context)) return `[Reference]`;

            weakSet.add(context);
            return Object.entries(context).reduce((aggregate, [key, value]) => {
                aggregate[key] = recursiveReduce(value);
                return aggregate;
            }, {} as Record<string | number, any>);
        } else if (typeof context === "function") {
            return `[Function: ${(context as Function).name || undefined}]`;
        } else {
            return context;
        }
    };

    return recursiveReduce(context);
}
