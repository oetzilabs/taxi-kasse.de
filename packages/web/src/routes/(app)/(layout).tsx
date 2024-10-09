import type { SystemNotifications } from "@taxikassede/core/src/entities/system_notifications";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { concat, filter } from "@solid-primitives/signal-builders";
import { A, createAsync, revalidate, RouteDefinition, RouteSectionProps, useAction } from "@solidjs/router";
import { useRealtime } from "~/components/Realtime";
import { getSystemNotifications, hideSystemNotification } from "~/lib/api/system_notifications";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Info from "lucide-solid/icons/info";
import Loader2 from "lucide-solid/icons/loader-2";
import X from "lucide-solid/icons/x";
import { createSignal, For, Match, onCleanup, onMount, Show, Suspense, Switch } from "solid-js";

export const route = {
  preload: (props) => {
    const session = getAuthenticatedSession();
    const notification = getSystemNotifications();

    return { session, notification };
  },
} satisfies RouteDefinition;

export default function DashboardLayout(props: RouteSectionProps) {
  const system_notifications = createAsync(() => getSystemNotifications());
  const hideSystemNotificationAction = useAction(hideSystemNotification);
  const [notificationIndex, setNotificationIndex] = createSignal(0);
  const [realtimeNotificationIndex, setRealtimeNotificationIndex] = createSignal(0);
  const [realtimeNotifications, setRealtimeNotifications] = createSignal(
    [] as Parameters<Parameters<typeof useRealtime<"systemnotification.created">>[1]>[0][]
  );

  const rt = useRealtime("systemnotification.created", async (p) => {
    console.log("RT:", p);
    const concatted = concat(realtimeNotifications, p);
    setRealtimeNotifications(concatted());
  });

  onMount(() => {
    if (!rt) {
      console.log("no realtime");
      return;
    }
    rt.subscribe();
    setInterval(() => {
      rt.publish({
        id: window.crypto.randomUUID(),
        link: null,
        message: "test test test",
        createdAt: new Date(),
      })
        .then(() => {
          console.log("done sending");
        })
        .catch((e) => {
          console.error("ER");
        });
    }, 5000);
  });

  onCleanup(() => {
    rt?.unsubscribe();
  });

  return (
    <div class="w-full flex flex-col gap-4 h-[calc(100vh-61px)] grow">
      <div class="flex flex-col grow w-full h-full">
        <div class="flex flex-col gap-0 w-full h-full relative">
          <Sidebar />
          <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
            <Show when={realtimeNotifications() && realtimeNotifications()!.length > 0 && realtimeNotifications()}>
              {(ns) => (
                <div class="flex flex-col gap-4 w-full">
                  <Show when={ns()[realtimeNotificationIndex()]} keyed>
                    {(n) => (
                      <div class="w-full flex flex-col gap-1 pl-5 pr-2.5 py-2 rounded-lg bg-[#d5e2f7] text-[#001c4d] dark:bg-[#001c4d] dark:text-[#d5e2f7]">
                        <div class="flex flex-row items-center justify-between gap-4">
                          <div class="flex flex-row items-center gap-4">
                            <Info class="size-4" />
                            <span class="text-lg font-bold">Ayyyy</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const filtered = filter(realtimeNotifications, (x) => x.id === n.id);
                              setRealtimeNotifications(filtered());
                            }}
                            class="size-8"
                          >
                            <X class="size-4" />
                          </Button>
                        </div>
                        <Show when={n.message}>
                          {(msg) => (
                            <div class="w-full flex flex-row gap-4 pb-1">
                              <div class="size-4" />
                              <div class="w-full text-justify text-sm">{msg()}</div>
                            </div>
                          )}
                        </Show>
                        <Show when={n.link}>
                          {(a) => (
                            <div class="w-full flex flex-row gap-4 pb-2">
                              <div class="size-4" />
                              <div class="w-full text-justify text-sm">
                                <Button as={A} size="sm" variant="secondary" href={a()}>
                                  {a()}
                                </Button>
                              </div>
                            </div>
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
            <Show when={system_notifications() && system_notifications()!.length > 0 && system_notifications()}>
              {(ns) => (
                <div class="flex flex-col gap-4 w-full">
                  <Show when={ns()[notificationIndex()]} keyed>
                    {(n) => (
                      <div class="w-full flex flex-col gap-1 pl-5 pr-2.5 py-2 rounded-lg bg-[#d5e2f7] text-[#001c4d] dark:bg-[#001c4d] dark:text-[#d5e2f7]">
                        <div class="flex flex-row items-center justify-between gap-4">
                          <div class="flex flex-row items-center gap-4">
                            <Info class="size-4" />
                            <span class="text-lg font-bold">{n.title}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              hideSystemNotificationAction(n.id);
                            }}
                            class="size-8"
                          >
                            <X class="size-4" />
                          </Button>
                        </div>
                        <Show when={n.message}>
                          {(msg) => (
                            <div class="w-full flex flex-row gap-4 pb-1">
                              <div class="size-4" />
                              <div class="w-full text-justify text-sm">{msg()}</div>
                            </div>
                          )}
                        </Show>
                        <Show when={n.action}>
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
                                          hideSystemNotificationAction(n.id);
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
          <div class="flex flex-col w-full h-full overflow-y-scroll">
            <div class="flex flex-col gap-0 w-full grow container mx-auto">{props.children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
