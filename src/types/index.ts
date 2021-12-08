/**
 * Returns the resolved value of a Promise
 */
export type Resolved<T> = T extends PromiseLike<infer U> ? Resolved<U> : T;
