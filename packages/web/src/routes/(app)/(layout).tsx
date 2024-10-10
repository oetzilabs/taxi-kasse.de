import type { Realtimed } from "@taxikassede/core/src/entities/realtime";
import type { SystemNotifications } from "@taxikassede/core/src/entities/system_notifications";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { concat, filter } from "@solid-primitives/signal-builders";
import { A, createAsync, revalidate, RouteDefinition, RouteSectionProps, useAction } from "@solidjs/router";
import { useRealtime } from "~/components/Realtime";
import { getSystemNotifications, hideSystemNotification } from "~/lib/api/system_notifications";
import dayjs from "dayjs";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Info from "lucide-solid/icons/info";
import Loader2 from "lucide-solid/icons/loader-2";
import X from "lucide-solid/icons/x";
import { createEffect, createSignal, For, Match, onCleanup, onMount, Show, Suspense, Switch } from "solid-js";
import { isServer } from "solid-js/web";
import { Transition } from "solid-transition-group";

export const route = {
  preload: (props) => {
    const session = getAuthenticatedSession();
    const notification = getSystemNotifications();

    return { session, notification };
  },
} satisfies RouteDefinition;

export default function DashboardLayout(props: RouteSectionProps) {
  const rt = useRealtime();
  const system_notifications = createAsync(() => getSystemNotifications());
  const hideSystemNotificationAction = useAction(hideSystemNotification);
  const [notificationIndex, setNotificationIndex] = createSignal(0);

  const [currentNotificationId, setCurrentNotificationId] = createSignal<string | null>(null);
  const [realtimeNotifications, setRealtimeNotifications] = createSignal(
    [] as Parameters<Parameters<typeof rt.subscribe<"systemnotification.created">>[1]>[0][],
  );

  createEffect(() => {
    if (isServer) {
      console.log("realtime not available on server");
      return;
    }
    const connected = rt.isConnected();
    if (!connected) {
      console.log("realtime not connected");
      return;
    } else {
      const subs = rt.subscriptions();
      if (subs.includes("systemnotification.created")) {
        console.log("realtime already subscribed to systemnotification.created, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("systemnotification.created", (payload) => {
        // console.log("received system notification", payload);
        const concatted = concat(realtimeNotifications, payload);
        setRealtimeNotifications(concatted());
        if (payload.id !== currentNotificationId()) {
          setCurrentNotificationId(payload.id);
        }
      });

      onCleanup(() => {
        rt.unsubscribe("systemnotification.created");
      });
    }
  });

  const removeNotification = (id: string) => {
    if (id === currentNotificationId()) {
      const remainingNotifications = realtimeNotifications().filter((n) => n.id !== id);
      setCurrentNotificationId(remainingNotifications.length > 0 ? remainingNotifications[0].id : null);
    }
    setRealtimeNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const currentNotification = () => realtimeNotifications().find((n) => n.id === currentNotificationId());
  const currentIndex = () => realtimeNotifications().findIndex((n) => n.id === currentNotificationId());

  const goToPrevious = () => {
    const index = currentIndex();
    if (index > 0) {
      setCurrentNotificationId(realtimeNotifications()[index - 1].id);
    }
  };

  const goToNext = () => {
    const index = currentIndex();
    if (index < realtimeNotifications().length - 1) {
      setCurrentNotificationId(realtimeNotifications()[index + 1].id);
    }
  };

  return (
    <div class="w-full flex flex-col gap-4 h-[calc(100vh-61px)] grow">
      <div class="flex flex-col grow w-full h-full">
        <div class="flex flex-col gap-0 w-full h-full relative">
          <Sidebar />
          <div class="flex flex-col w-full h-full overflow-y-scroll">
            <div class="flex flex-col gap-0 w-full grow container mx-auto">
              <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
                <Transition name="slide-fade-up">
                  <Show when={realtimeNotifications().length > 0 && currentNotification()}>
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
                              onClick={() => removeNotification(currentNotification()!.id)}
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
                                disabled={currentIndex() === realtimeNotifications().length - 1}
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
                <Show when={system_notifications() && system_notifications()!.length > 0 && system_notifications()}>
                  {(ns) => (
                    <div class="flex flex-col gap-4 w-full">
                      <Show when={ns()[notificationIndex()]}>
                        {(n) => (
                          <div class="w-full flex flex-col gap-1 pl-5 pr-2.5 py-2 rounded-lg bg-[#d5e2f7] text-[#001c4d] dark:bg-[#001c4d] dark:text-[#d5e2f7]">
                            <div class="flex flex-row items-center justify-between gap-4">
                              <div class="flex flex-row items-center gap-4">
                                <Info class="size-4" />
                                <span class="text-lg font-bold">{n().title}</span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  hideSystemNotificationAction(n().id);
                                }}
                                class="size-8"
                              >
                                <X class="size-4" />
                              </Button>
                            </div>
                            <Show when={n().message}>
                              {(msg) => (
                                <div class="w-full flex flex-row gap-4 pb-1">
                                  <div class="size-4" />
                                  <div class="w-full text-justify text-sm">{msg()}</div>
                                </div>
                              )}
                            </Show>
                            <Show when={n().action}>
                              {(a) => (
                                <Switch>
                                  <Match
                                    when={
                                      a().type === "hide" &&
                                      (a() as Extract<SystemNotifications.Info["action"], { type: "hide" }>)
                                    }
                                  >
                                    {(action) => (
                                      <div class="w-full flex flex-row gap-4 pb-2">
                                        <div class="size-4" />
                                        <div class="w-max">
                                          <Button
                                            size="sm"
                                            onClick={async () => {
                                              hideSystemNotificationAction(n().id);
                                              await revalidate([getSystemNotifications.key]);
                                            }}
                                            variant="secondary"
                                          >
                                            {action().label}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </Match>
                                  <Match
                                    when={
                                      a().type === "open:link" &&
                                      (a() as Extract<SystemNotifications.Info["action"], { type: "open:link" }>)
                                    }
                                  >
                                    {(action) => (
                                      <div class="w-full flex flex-row gap-4 pb-2">
                                        <div class="size-4" />
                                        <div class="w-full text-justify text-sm">
                                          <Button as={A} size="sm" variant="secondary" href={action().href}>
                                            {action().label}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </Match>
                                </Switch>
                              )}
                            </Show>
                          </div>
                        )}
                      </Show>
                      <div class="flex flex-row gap-4 w-full items-center justify-between">
                        <div />
                        <div class="flex flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setNotificationIndex((i) => Math.max(i - 1, 0))}
                            class="flex flex-row items-center gap-2"
                            disabled={notificationIndex() === 0}
                          >
                            <ArrowLeft class="size-4" />
                            <span>Previous</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setNotificationIndex((i) => Math.min(i + 1, ns().length - 1))}
                            class="flex flex-row items-center gap-2"
                            disabled={notificationIndex() === ns().length - 1}
                          >
                            <span>Next</span>
                            <ArrowRight class="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
