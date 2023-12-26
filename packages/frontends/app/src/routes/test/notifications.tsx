import { createMutation } from "@tanstack/solid-query";
import { Mutations } from "../../utils/api/mutations";
import { useAuth } from "../../components/Auth";
import { Notify } from "@taxi-kassede/core/entities/notifications";

export default function TestNotifications() {
  const [auth] = useAuth();

  const sendTestNotification = createMutation(() => ({
    mutationFn: async (n: Omit<Notify, "id">) => {
      const token = auth.token;
      if (!token) {
        return Promise.reject("No token");
      }
      return Mutations.Notifications.send(token, n);
    },
    mutationKey: ["send-test-notification"],
  }));

  return (
    <div class="p-4 flex flex-col gap-4">
      <h1>Test Notifications</h1>
      <button
        class="w-max px-2 py-1 text-sm flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800"
        onClick={async () => {
          await sendTestNotification.mutateAsync({
            dismissedAt: null,
            type: "user:info",
            title: "Test Notification",
            content:
              "This is a test notification with short content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl.",
          });
        }}
      >
        Broadtcast Test Notification
      </button>
      <button
        class="w-max px-2 py-1 text-sm flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800"
        onClick={async () => {
          await sendTestNotification.mutateAsync({
            dismissedAt: null,
            type: "user:info",
            title: "Test Notification",
            content:
              "This is a test notification with a long content: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nisl.",
          });
        }}
      >
        Broadtcast Test Notification (Long Text)
      </button>
    </div>
  );
}
