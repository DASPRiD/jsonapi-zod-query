export type Identity<T> = T;
export type Flatten<T> = Identity<{ [K in keyof T]: T[K] }>;

export type InferPropertyType<T, K extends keyof T> = T[K] extends undefined
    ? undefined
    : Exclude<T[K], undefined>;
