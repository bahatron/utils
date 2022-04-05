import { AsyncContext } from "./async-context";

export const RunInContext = (
    func: Function,
    context: Record<string, any> = {},
) => {
    Object.entries(context).forEach(([key, value]) => {
        AsyncContext.set(key, value);
    });

    return func();
};
