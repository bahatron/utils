import { AsyncContext } from "./async-context";

export const RunInContext = <T = any>(
    func: () => T,
    context: Record<string, any> = {},
): T => {
    Object.entries(context).forEach(([key, value]) => {
        AsyncContext.set(key, value);
    });

    return func();
};
