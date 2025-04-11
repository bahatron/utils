export type Truthy<T> = false extends T
    ? never
    : 0 extends T
    ? never
    : "" extends T
    ? never
    : null extends T
    ? never
    : undefined extends T
    ? never
    : T;
