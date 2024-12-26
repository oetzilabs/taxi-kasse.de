import { action, json, query } from "@solidjs/router";
import { Calendar } from "@taxikassede/core/src/entities/calendar";
import dayjs from "dayjs";
import { ensureAuthenticated } from "../auth/context";

export const getCalendar = query(
  async (
    dates: { from: Date; to: Date } = {
      from: dayjs().startOf("month").add(1, "day").toDate(),
      to: dayjs().endOf("month").toDate(),
    },
  ) => {
    "use server";
    const [ctx, event] = await ensureAuthenticated();
    const user_id = ctx.user.id;
    const company_id = ctx.session.company_id;
    if (!company_id) {
      throw new Error("Please select a company first");
    }
    const today = dayjs().startOf("day");
    const start_of_month = today.startOf("month").add(1, "day");
    const end_of_month = today.endOf("month");
    // merge dates if provided
    const default_dates = {
      from: start_of_month.toDate(),
      to: end_of_month.toDate(),
    };
    if (!dates) {
      dates = default_dates;
    }
    const d = {
      from: dates.from ?? default_dates.from,
      to: dates.to ?? default_dates.to,
    };
    const calendar_entries = await Calendar.findEntriesByUserIdAndCompanyId(user_id, company_id, d);
    return calendar_entries;
  },
  "calendar",
);

export const upsertDailyRecord = action(async (data_upsert: Calendar.Creator) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();
  const created_by = ctx.user.id;
  const company_id = ctx.session.company_id;
  if (!company_id) {
    throw new Error("Please select a company first");
  }
  const data = {
    ...data_upsert,
    created_by,
    company_id,
  };
  const calendar_entry_exists = await Calendar.findByDateCompanyUser(data.date, data.company_id, data.created_by);
  let calendar_entry;
  if (!calendar_entry_exists) {
    calendar_entry = await Calendar.create(data);
  } else {
    calendar_entry = await Calendar.update({ id: calendar_entry_exists.id, ...data, deletedAt: null });
  }
  return json(calendar_entry, {
    revalidate: [getCalendar.key],
  });
});

export const updateDailyRecord = action(async (data_update: Calendar.Updater) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();
  const user_id = ctx.user.id;
  const entry = await Calendar.findById(data_update.id);
  if (!entry) {
    throw new Error("Entry not found");
  }
  if (entry.created_by !== user_id && entry.company_id !== user_id) {
    throw new Error("Not authorized to update this entry");
  }
  const calendar_entry = await Calendar.update(data_update);
  return json(calendar_entry, {
    revalidate: [getCalendar.key],
  });
});

export const deleteDailyRecord = action(async (data_delete_id: string) => {
  "use server";
  const [ctx, event] = await ensureAuthenticated();
  const user_id = ctx.user.id;
  const entry = await Calendar.findById(data_delete_id);
  if (!entry) {
    throw new Error("Entry not found");
  }
  if (entry.created_by !== user_id && entry.company_id !== user_id) {
    throw new Error("Not authorized to delete this entry");
  }
  const calendar_entry = await Calendar.update({ id: data_delete_id, deletedAt: new Date() });
  return json(calendar_entry, {
    revalidate: [getCalendar.key],
  });
});
