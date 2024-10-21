import { action, cache, json, redirect } from "@solidjs/router";
import { Events } from "@taxikassede/core/src/entities/events";
import { Realtimed } from "@taxikassede/core/src/entities/realtime";
import { InferInput } from "valibot";
import { getContext } from "../auth/context";

export const getEvents = cache(async () => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const events = await Events.allNonDeleted();

  return events;
}, "events");

export const getEvent = cache(async (id: string) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const event_ = await Events.findById(id);
  if (!event_) {
    throw redirect("/404", {
      status: 404,
      statusText: "This event does not exist.",
    });
  }

  return event_;
}, "event");

export const createEvent = action(async (data: InferInput<typeof Events.Create>) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const mergeWithUser = Object.assign(data, {
    created_by: ctx.user.id,
  });

  const event_ = await Events.create(mergeWithUser);

  const mqttSent = await Realtimed.sendToMqtt("event", event_, "created");
  if (!mqttSent) {
    console.error("MQTT send failed");
  }

  return json(event_, { revalidate: [getEvents.key] });
});

export const updateEvent = action(async (data: InferInput<typeof Events.UpdateSchema>) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const mergeWithUser = Object.assign(data, {
    updated_by: ctx.user.id,
  });

  const event_ = await Events.update(mergeWithUser);

  const mqttSent = await Realtimed.sendToMqtt("event", event_, "updated");
  if (!mqttSent) {
    console.error("MQTT send failed");
  }

  return json(event_, { revalidate: [getEvents.key] });
});

export const removeEvent = action(async (id: string) => {
  "use server";
  const [ctx] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const event_ = await Events.findById(id);
  if (!event_) {
    throw new Error("This event does not exist");
  }

  const updated = await Events.remove(event_.id);

  const mqttSent = await Realtimed.sendToMqtt("event", event_, "deleted");
  if (!mqttSent) {
    console.error("MQTT send failed");
  }

  return json(updated, {
    revalidate: [getEvents.key, getEvent.keyFor(event_.id)],
    headers: {
      Location: "/dashboard/events",
    },
    status: 303,
    statusText: `Removed event: '${event_.id}', redirecting to eventslist`,
  });
});
