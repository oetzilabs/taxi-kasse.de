import type { Notifications } from "@taxikassede/core/src/entities/notifications";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { concat } from "@solid-primitives/signal-builders";
import { A, createAsync, RouteDefinition, RouteSectionProps, useAction } from "@solidjs/router";
import { useRealtime } from "~/components/Realtime";
import { getSystemNotifications } from "~/lib/api/system_notifications";
import dayjs from "dayjs";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Info from "lucide-solid/icons/info";
import Loader2 from "lucide-solid/icons/loader-2";
import X from "lucide-solid/icons/x";
import { Accessor, createEffect, createSignal, onCleanup, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { toast } from "solid-sonner";
import { Transition } from "solid-transition-group";
import { getAllNotifications, hideNotification } from "../../lib/api/notifications";

export const route = {
  preload: () => {
    const session = getAuthenticatedSession();
    const notification = getSystemNotifications();

    return { session, notification };
  },
} satisfies RouteDefinition;

const NotificationList = (props: {
  list: Accessor<Array<Notifications.Info>>;
  onHide: (id: string, type: Notifications.Types) => Promise<void>;
}) => {
  const rt = useRealtime();
  const [list, setList] = createSignal<Array<Notifications.Info>>(props.list());

  const [currentNotificationId, setCurrentNotificationId] = createSignal<string | null>(null);

  createEffect(() => {
    if (isServer) {
      console.log("realtime not available on server");
      return;
    }
    const connected = rt.isConnected();
    if (!connected) {
      return;
    } else {
      const subs = rt.subscriptions();
      if (subs.has("systemnotification")) {
        console.log("realtime already subscribed to systemnotification.created, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("systemnotification", (payload, action) => {
        switch (action) {
          case "created":
            // console.log("received system notification", payload);
            const concatted = concat(list, payload);
            setList(concatted());
            if (payload.id !== currentNotificationId()) {
              setCurrentNotificationId(payload.id);
            }
            break;
          default:
            console.log("unknown action", action);
            break;
        }
      });
    }
  });

  const removeNotification = async (id: string) => {
    if (id === currentNotificationId()) {
      const type = list().find((n) => n.id === id)!.type;
      await props
        .onHide(id, type)
        .then(() => {
          const remainingNotifications = list().filter((n) => n.id !== id);
          setCurrentNotificationId(remainingNotifications.length > 0 ? remainingNotifications[0].id : null);
        })
        .catch((e) => {
          toast.error(e.message);
        });
    }
    setList((prev) => prev.filter((n) => n.id !== id));
  };

  const currentNotification = () => list().find((n) => n.id === currentNotificationId());
  const currentIndex = () => list().findIndex((n) => n.id === currentNotificationId());

  const goToPrevious = () => {
    const index = currentIndex();
    if (index > 0) {
      setCurrentNotificationId(list()[index - 1].id);
    }
  };

  const goToNext = () => {
    const index = currentIndex();
    if (index < list().length - 1) {
      setCurrentNotificationId(list()[index + 1].id);
    }
  };

  createEffect(() => {
    const l = props.list();
    if (l.length === 0) {
      return;
    }
    setList(l);
  });

  return (
    <Transition name="slide-fade-up">
      <Show when={list().length > 0 && currentNotification()}>
        {(n) => (
          <div class="flex flex-col gap-4 w-full pt-4">
            <div class="w-full flex flex-col gap-1 pl-5 pr-2.5 py-2 rounded-lg bg-[#d5e2f7] text-[#001c4d] dark:bg-[#001c4d] dark:text-[#d5e2f7]">
              <div class="flex flex-row items-center justify-between gap-4">
                <div class="flex flex-row items-baseline gap-4">
                  <Info class="size-4" />
                  <div class="flex flex-row items-baseline gap-2">
                    <span class="text-lg font-bold">{n().title}</span>
                    <span class="text-xs italic">{dayjs(n().createdAt).format("HH:mm")}</span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => await removeNotification(currentNotification()!.id)}
                  class="size-8"
                >
                  <X class="size-4" />
                </Button>
              </div>
              <Show when={currentNotification()!.message}>
                <div class="w-full flex flex-row gap-4 pb-1">
                  <div class="w-4 h-4" />
                  <div class="w-full text-justify text-sm">{currentNotification()!.message}</div>
                </div>
              </Show>
              <Show when={currentNotification()!.link}>
                <div class="w-full flex flex-row gap-4 pb-2">
                  <div class="w-4 h-4" />
                  <div class="w-full text-justify text-sm">
                    <Button as={A} size="sm" variant="secondary" href={currentNotification()!.link!}>
                      {currentNotification()!.link}
                    </Button>
                  </div>
                </div>
              </Show>
              <div class="flex flex-row gap-4 w-full items-center justify-between">
                <div />
                <div class="flex flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={goToPrevious}
                    class="flex flex-row items-center gap-2"
                    disabled={currentIndex() === 0}
                  >
                    <ArrowLeft class="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={goToNext}
                    class="flex flex-row items-center gap-2"
                    disabled={currentIndex() === list().length - 1}
                  >
                    <span>Next</span>
                    <ArrowRight class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>
    </Transition>
  );
};

export default function DashboardLayout(props: RouteSectionProps) {
  const allNotifications = createAsync(() => getAllNotifications());
  const hideNotificationAction = useAction(hideNotification);

  return (
    <div class="w-full flex flex-col gap-4 h-[calc(100vh-61px)] grow">
      <div class="flex flex-col grow w-full h-full">
        <div class="flex flex-col gap-0 w-full h-full relative">
          <Sidebar />
          <div class="flex flex-col w-full h-full overflow-y-scroll">
            <div class="flex flex-col gap-0 w-full grow container mx-auto">
              <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
                <Show when={allNotifications() && allNotifications()}>
                  {(ns) => (
                    <NotificationList
                      list={ns}
                      onHide={async (id, type) => {
                        await hideNotificationAction(id, type);
                      }}
                    />
                  )}
                </Show>
              </Suspense>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
