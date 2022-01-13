import cls from "cls-hooked";

export const AsyncContext = cls.createNamespace(".");

export function Context(func: Function) {
    return function (...args: any[]) {
        AsyncContext.run(() => func(...args));
    };
}
