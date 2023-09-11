import { ApiHandler } from "sst/node/api";
import { Test } from "@taxi-kassede/core/test";
import { z } from "zod";

export const create = ApiHandler(async (_evt) => {
  const data = z.object({ name: z.string() }).safeParse(JSON.parse(_evt.body!));
  if (!data.success) {
    return {
      statusCode: 400,
      body: JSON.stringify(data.error),
    };
  }
  await Test.create(data.data);

  return {
    statusCode: 200,
    body: "Test created",
  };
});

export const test = ApiHandler(async (_evt) => {
  return {
    statusCode: 200,
    body: "Test",
  };
});

export const list = ApiHandler(async (_evt) => {
  return {
    statusCode: 200,
    body: JSON.stringify(Test.list()),
  };
});
