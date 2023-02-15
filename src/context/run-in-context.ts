import { AsyncContext } from "./async-context";

export const RunInContext = <T = any>(
    func: () => T,
    context: Record<string, any> = {},
): Promise<T> => {
    return new Promise<T>((resolve) => {
        Object.entries(context).forEach(([key, value]) => {
            AsyncContext.set(key, value);
        });

        return Promise.resolve(func()).then(resolve);
    });
};
