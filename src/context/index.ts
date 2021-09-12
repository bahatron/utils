import { ns } from "express-http-context";
export { ns as AsyncContext };

export function Context(func: Function) {
    return function (...args: any[]) {
        ns.run(() => func(...args));
    };
}

export const RunInContext = (
    func: Function,
    context: Record<string, string> = {}
) => {
    Context((...args: any[]) => {
        Object.entries(context).forEach(([key, value]) => {
            ns.set(key, value);
        });

        func(args);
    })();
};
