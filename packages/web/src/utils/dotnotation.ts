export type DotNotation<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? DotNotation<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`>
    : `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`;
}[keyof T];
