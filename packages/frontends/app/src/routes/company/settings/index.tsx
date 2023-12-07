import { Tabs, TextField } from "@kobalte/core";
import { Show, createSignal } from "solid-js";
import { useLocation, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";

export const routeData = () => {
  const userSettingsData = createServerData$(
    async (_, request) => {
      const profile = await fetch(`${import.meta.env.VITE_API_URL}/profile`).then(async (res) => res.json());

      if (!profile) {
        return {
          profile: null,
        };
      }
      return {
        profile,
      };
    },
    {
      key: "userSettingsData",
    }
  );

  return userSettingsData;
};

export default function Settings() {
  const p = useRouteData<typeof routeData>();
  const hash = useLocation().hash;
  const [tab, setTab] = createSignal(hash ? hash.replace("#", "") : "main");

  return (
    <div class="container p-4 flex flex-col gap-2 mx-auto">
      <div class="w-full flex flex-col gap-4">
        <h1 class="text-2xl font-bold">Settings</h1>
        <Tabs.Root class="flex flex-row gap-2 w-full" value={tab()} onChange={setTab}>
          <Tabs.List class="flex w-max flex-col gap-2">
            <Tabs.Trigger
              value="main"
              class="flex min-w-[200px] justify-start items-center bg-black/5 dark:bg-white/5 p-2 rounded"
            >
              Main
            </Tabs.Trigger>
            <Tabs.Trigger
              value="profile"
              class="flex min-w-[200px] justify-start items-center bg-black/5 dark:bg-white/5 p-2 rounded"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              value="security"
              class="flex min-w-[200px] justify-start items-center bg-black/5 dark:bg-white/5 p-2 rounded"
            >
              Security
            </Tabs.Trigger>
            <Tabs.Trigger
              value="billing"
              class="flex min-w-[200px] justify-start items-center bg-black/5 dark:bg-white/5 p-2 rounded"
            >
              Billing
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="main" class="flex-1 flex flex-col gap-2 p-4">
            <div class="flex flex-col gap-2"></div>
          </Tabs.Content>
          <Tabs.Content value="profile" class="flex-1 flex flex-col gap-2">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-2">
                <h2 class="text-xl font-bold">Profile</h2>
                {/* <Show when={!p.loading && p() && p()?.profile}>
                  {(profile) => ( */}
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-2">
                    <TextField.Root class="flex flex-col gap-2">
                      <TextField.Label class="text-sm">Name</TextField.Label>
                      <TextField.Input
                        class="text-sm p-2 rounded-sm bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                        value={
                          // profile().preferredUsername ??
                          ""
                        }
                      />
                    </TextField.Root>
                  </div>
                </div>
                {/* )}
                </Show> */}
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
