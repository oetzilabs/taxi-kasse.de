import dayjs from "dayjs";
import { DotNotation } from "./dotnotation";

export * from "./dotnotation";

//` keep this here... neovim struggles with the highlighting

export const stringify = <T extends any>(obj: T) => {
  const t = typeof obj;
  if (t === "string") return obj as string;
  if (t === "number") return (obj as number).toString();
  if (t === "boolean") return (obj as boolean).toString();

  if (obj instanceof Date) return dayjs(obj).toISOString();
  if (t === "object") {
    if (obj === null) return "null";
    if (Array.isArray(obj)) {
      const arr: Array<string> = [];
      for (let i = 0; i < obj.length; i++) {
        arr.push(stringify(obj[i]));
      }
      return `[${arr.join(",")}]`;
    }
    const o = obj as Record<string, unknown>;
    const objKeys = Object.keys(o);
    const objValues: any[] = objKeys.map((k) => stringify(o[k]));
    return `{${objKeys.map((k, i) => `${k}:${objValues[i]}`).join(",")}}`;
  }
  return "null";
};

export const dFormat = (d: Date) => dayjs(d).format("MMMM-YYYY");

export const traverse = <T>(obj: any, path: DotNotation<T>): any => {
  // @ts-ignore
  const paths = path.split(".");
  let current = obj;

  for (let i = 0; i < paths.length; i++) {
    const key = paths[i] as keyof typeof current;

    // Check if the current object contains the key
    if (current[key] === undefined) {
      return undefined;
    }

    current = current[key];
  }

  return current;
};
