import { Falsy } from "./falsy";

export type Truthy<T = true> = T extends Falsy ? never : T;
