import { cuid2, email, minValue, number, pipe, safeParse, string, transform, ValiError } from "valibot";
import { z } from "zod";

export module Validator {
  export const prefixed_cuid2 = z.custom<string>((val: string) => {
    const splitUnderscore = val.split("_");
    const lastString = splitUnderscore[splitUnderscore.length - 1];

    // check if the string is a valid cuid2
    const isValid = z.string().cuid2().safeParse(lastString);
    return isValid.success ? z.string().cuid2().safeParse(lastString) : z.NEVER;
  });

  export const Cuid2 = pipe(string(), cuid2());
  export const EmailSchema = pipe(string(), email());

  export const Cuid2Schema = pipe(
    string(),
    transform((input: string) => {
      if (!input.includes("_")) {
        throw new ValiError([
          {
            kind: "validation",
            input,
            type: "underscore",
            expected: "At least one underscore",
            received: input,
            message: "The provided input is missing an underscore",
          },
        ]);
      }

      const s = input.split("_");

      const parsed = safeParse(Cuid2, s[s.length - 1]);

      if (parsed.success) {
        return input;
      } else {
        throw parsed.issues;
      }
    }),
  );

  export const MinZeroSchema = pipe(number(), minValue(0));
}
