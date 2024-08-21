import { z } from "zod";

export const prefixed_cuid2 = z.custom<string>((val: string) => {
  // take the prefix out of the string by cutting after the last underscore. exg: sys_ntf_123456789012345678901234567890 -> 123456789012345678901234567890
  const splitUnderscore = val.split("_");
  const lastString = splitUnderscore[splitUnderscore.length - 1];

  // check if the string is a valid cuid2
  const isValid = z.string().cuid2().safeParse(lastString);
  return isValid.success ? z.string().cuid2().safeParse(lastString) : z.NEVER;
});
