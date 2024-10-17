export type DotNotation<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Date
      ? `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`
      : DotNotation<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`>
    : `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`;
}[keyof T];
