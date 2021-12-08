import { ns } from "express-http-context";

export { ns as AsyncContext };

export function Context(func: Function) {
    return function (...args: any[]) {
        ns.run(() => func(...args));
    };
}
