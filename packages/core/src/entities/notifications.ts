import { date, InferInput, InferOutput, nullable, object, picklist, safeParse, string } from "valibot";
import { db } from "../drizzle/sql";
import { user_hidden_system_notifications } from "../drizzle/sql/schema";
import { Validator } from "../validator";

export module Notifications {
  export const Info = object({
    id: string(),
    type: picklist(["system", "organization", "company"]),
    title: string(),
    message: nullable(string()),
    link: nullable(string()),
    createdAt: date(),
    updatedAt: nullable(date()),
    deletedAt: nullable(date()),
  });

  export type Info = InferOutput<typeof Notifications.Info>;

  export const Types = Info.entries.type;
  export type Types = InferOutput<typeof Notifications.Types>;

  export const allNonHiddenByUser = async (
    user_id: InferInput<typeof Validator.Cuid2Schema>,
    type: Notifications.Types,
    tsx = db,
  ) => {
    const isValid = safeParse(Notifications.Types, type);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const isValid2 = safeParse(Validator.Cuid2Schema, user_id);
    if (!isValid2.success) {
      throw isValid2.issues;
    }
    const ns: Array<Notifications.Info> = [];
    switch (isValid.output) {
      case "system":
        const sys_notifications = await tsx.query.system_notifications.findMany({
          where: (fields, ops) => ops.isNull(fields.deletedAt),
        });
        for (const n of sys_notifications) {
          ns.push({
            id: n.id,
            type: "system",
            title: n.title,
            message: n.message,
            link: n.action?.type === "open:link" ? n.action.href : null,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
            deletedAt: n.deletedAt,
          });
        }
        const hidden_sys_notifications = await tsx.query.user_hidden_system_notifications.findMany({
          where: (fields, ops) => ops.eq(fields.user_id, isValid2.output),
        });
        for (const h of hidden_sys_notifications) {
          const index = ns.findIndex((n) => n.id === h.system_notification_id);
          if (index >= 0) {
            ns.splice(index, 1);
          }
        }
        break;
      case "organization":
        // const org_notifications = await tsx.query.organization_notifications.findMany({
        //   where: (fields, ops) => ops.isNull(fields.deletedAt),
        // });
        // for (const n of org_notifications) {
        //   ns.push({
        //     id: n.id,
        //     type: "organization",
        //     title: n.title,
        //     message: n.message,
        //     link: n.action?.type === "open:link" ? n.action.href : null,
        //     createdAt: n.createdAt,
        //     updatedAt: n.updatedAt,
        //     deletedAt: n.deletedAt,
        //   });
        // }
        // const hidden_org_notifications = await tsx.query.user_hidden_org_notifications.findMany({
        //   where: (fields, ops) => ops.eq(fields.user_id, isValid2.output),
        // });
        // for (const h of hidden_org_notifications) {
        //   const index = ns.findIndex((n) => n.id === h.notification_id);
        //   if (index >= 0) {
        //     ns.splice(index, 1);
        //   }
        // }
        break;
      case "company":
        // const comp_notifications = await tsx.query.company_notifications.findMany({
        //   where: (fields, ops) => ops.isNull(fields.deletedAt),
        // });
        // for (const n of comp_notifications) {
        //   ns.push({
        //     id: n.id,
        //     title: n.title,
        //     type: "company",
        //     message: n.message,
        //     link: n.action?.type === "open:link" ? n.action.href : null,
        //     createdAt: n.createdAt,
        //     updatedAt: n.updatedAt,
        //     deletedAt: n.deletedAt,
        //   });
        // }
        // const hidden_comp_notifications = await tsx.query.user_hidden_comp_notifications.findMany({
        //   where: (fields, ops) => ops.eq(fields.user_id, isValid2.output),
        // });
        // for (const h of hidden_comp_notifications) {
        //   const index = ns.findIndex((n) => n.id === h.notification_id);
        //   if (index >= 0) {
        //     ns.splice(index, 1);
        //   }
        // }
        break;
    }

    return ns;
  };

  export const userHidesById = async (
    notification_id: InferInput<typeof Validator.Cuid2Schema>,
    type: Notifications.Types,
    user_id: InferInput<typeof Validator.Cuid2Schema>,
    tsx = db,
  ) => {
    const isValid = safeParse(Notifications.Types, type);
    if (!isValid.success) {
      throw isValid.issues;
    }
    const isValid2 = safeParse(Validator.Cuid2Schema, user_id);
    if (!isValid2.success) {
      throw isValid2.issues;
    }

    switch (isValid.output) {
      case "system":
        // add to user_hidden_system_notifications
        const [added_hidden_sys] = await tsx
          .insert(user_hidden_system_notifications)
          .values({
            user_id: isValid2.output,
            system_notification_id: isValid.output,
          })
          .returning();
        return added_hidden_sys;
      case "organization":
      // add to user_hidden_org_notifications
      // const [added_hidden_org] = await tsx
      //   .insert(user_hidden_org_notifications)
      //   .values({
      //     user_id: isValid2.output,
      //     notification_id: isValid.output,
      //   })
      //   .returning();
      // return added_hidden_org;
      case "company":
        // // add to user_hidden_comp_notifications
        // const [added_hidden_comp] = await tsx
        //   .insert(user_hidden_comp_notifications)
        //   .values({
        //     user_id: isValid2.output,
        //     notification_id: isValid.output,
        //   })
        //   .returning();
        // }
        // return added_hidden_comp;
        break;
    }
  };
  export const findById = async (id: InferInput<typeof Validator.Cuid2Schema>, type: Notifications.Types, tsx = db) => {
    const isValid = safeParse(Notifications.Types, type);
    if (!isValid.success) {
      throw isValid.issues;
    }
    switch (isValid.output) {
      case "system":
        const isValid2 = safeParse(Validator.Cuid2Schema, id);
        if (!isValid2.success) {
          throw isValid2.issues;
        }
        return tsx.query.system_notifications.findFirst({
          where: (fields, ops) => ops.eq(fields.id, isValid2.output),
        });
      case "organization":
      // const isValid2 = safeParse(Validator.Cuid2Schema, id);
      // if (!isValid2.success) {
      //   throw isValid2.issues;
      // }
      // return tsx.query.organization_notifications.findFirst({
      //   where: (fields, ops) => ops.eq(fields.id, isValid2.output),
      //   with: _with,
      // });
      case "company":
        // const isValid2 = safeParse(Validator.Cuid2Schema, id);
        // if (!isValid2.success) {
        //   throw isValid2.issues;
        // }
        // return tsx.query.company_notifications.findFirst({
        //   where: (fields, ops) => ops.eq(fields.id, isValid2.output),
        //   with: _with,
        // });
        break;
    }
  };
}
