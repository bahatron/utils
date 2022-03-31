import cls from "cls-hooked";
import { randomUUID } from "crypto";

export const AsyncContext = cls.createNamespace(randomUUID());

export function Context(func: Function) {
    return function (...args: any[]) {
        AsyncContext.run(() => func(...args));
    };
}
