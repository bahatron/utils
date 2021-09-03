import { ns } from "express-http-context";

export { ns as AsyncContext };

export const Context = (func: Function) => {
    return function (...args: any[]) {
        ns.run(() => func(...args));
    };
};

export const RunInContext = (func: Function) => {
    Context(func)();
};
