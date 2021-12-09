import { AsyncContext, Context } from "../context";

export const RunInContext = (
    func: Function,
    context: Record<string, any> = {}
) => {
    Context(() => {
        Object.entries(context).forEach(([key, value]) => {
            AsyncContext.set(key, value);
        });

        func();
    })();
};
