import { createId } from "@paralleldrive/cuid2";
import { BuildExtraConfigColumns, Table } from "drizzle-orm";
import { PgColumnBuilderBase, PgTableExtraConfig, timestamp, varchar } from "drizzle-orm/pg-core";
import { schema } from "./utils";

export * as Entity from "./entity";

const defaults = (prefix: string) => ({
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => `${prefix}_${createId()}`),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export function commonTable<
  TTableName extends string,
  TColumnsMap extends Record<string, PgColumnBuilderBase>,
  TPrefix extends string,
>(
  name: TTableName,
  columns: TColumnsMap,
  prefix: TPrefix,
  extraConfig?: (
    self: BuildExtraConfigColumns<TTableName, TColumnsMap & ReturnType<typeof defaults>, "pg">,
  ) => PgTableExtraConfig,
) {
  return schema.table<TTableName, TColumnsMap & ReturnType<typeof defaults>>(
    name,
    Object.assign(columns, defaults(prefix)),
    extraConfig,
  );
}
