export interface RetryOptions {
    tries?: number;
}

export function retry<T>(handler: () => T, { tries = 3 }: RetryOptions = {}) {
    let retrier = async (tryNumber = 0): Promise<T> => {
        try {
            return await handler();
        } catch (err) {
            if (tryNumber >= tries) throw err;

            return retrier(tryNumber + 1);
        }
    };

    return retrier();
}
