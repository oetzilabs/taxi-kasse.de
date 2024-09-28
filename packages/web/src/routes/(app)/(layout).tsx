import type { SystemNotifications } from "@taxikassede/core/src/entities/system_notifications";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, revalidate, RouteDefinition, RouteSectionProps, useAction } from "@solidjs/router";
import { getSystemNotifications, hideSystemNotification } from "~/lib/api/system_notifications";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Info from "lucide-solid/icons/info";
import X from "lucide-solid/icons/x";
import { createSignal, For, Match, Show, Switch } from "solid-js";

export const route = {
  preload: (props) => {
    const session = getAuthenticatedSession();
    const notification = getSystemNotifications();

    return { session, notification };
  },
  load: (props) => {
    const session = getAuthenticatedSession();
    const notification = getSystemNotifications();

    return { session, notification };
  },
} satisfies RouteDefinition;

export default function DashboardLayout(props: RouteSectionProps) {
  const notification = createAsync(() => getSystemNotifications());
  const hideSystemNotificationAction = useAction(hideSystemNotification);
  const [notificationIndex, setNotificationIndex] = createSignal(0);
  return (
    <div class="w-full flex flex-col gap-4 overflow-y-scroll h-[calc(100vh-65px)]">
      <div class="flex flex-col grow border-x border-neutral-200 dark:border-neutral-800 px-0">
        <div class="flex flex-col gap-0 w-full relative">
          <Sidebar />
          <Show when={notification() && notification()!.length > 0 && notification()}>
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
          <div class="flex flex-col gap-0 w-full grow container mx-auto">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
