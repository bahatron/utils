import { sleep } from "./sleep";

export interface RetryOptions {
    tries?: number;
    timeout?: number;
    factor?: number;
}

/**
 * @param timeout in milliseconds, defaults to 0
 * @param factor integer for exponential backoff, defaults to 1
 * @param tries defaults to 3
 */
export function retry<T>(
    handler: () => T,
    { tries = 3, timeout = 0, factor = 1 }: RetryOptions = {},
) {
    let retrier = async (tryNumber = 0): Promise<T> => {
        try {
            return await handler();
        } catch (err) {
            let waitTime = Math.floor(
                100 * Math.random() + timeout * Math.pow(factor, tryNumber + 1),
            );

            await sleep(waitTime);

            if (tryNumber >= tries) throw err;

            return retrier(tryNumber + 1);
        }
    };

    return retrier();
}
