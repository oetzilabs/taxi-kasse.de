import { action, cache } from "@solidjs/router";

export const getSystemNotifications = cache(async () => {
  "use server";
  return [
    {
      id: "welcome-message",
      message: "Welcome to the app!",
      bgColor: "#0a22aa",
      textColor: "#ffffff",
    },
  ];
}, "system-notifications");

export const hideSystemNotification = action(async (id: string) => {
  "use server";

  return true;
});
