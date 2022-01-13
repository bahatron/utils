export interface RetryOptions {
    tries?: number;
}

export function retry<T>(
    handler: (...any: any[]) => T,
    { tries = 3 }: RetryOptions = {},
) {
    return async function (...params: any[]): Promise<T> {
        let retrier = async (tryNumber = 1): Promise<T> => {
            try {
                return await handler(...params);
            } catch (err) {
                if (tryNumber >= tries) {
                    throw err;
                }

                return retrier(tryNumber++);
            }
        };

        return retrier();
    };
}
