export type Resolved<T> = T extends PromiseLike<infer U> ? Resolved<U> : T;

export type ObjectBag = Record<string, any>;
