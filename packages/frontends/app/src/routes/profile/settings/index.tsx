import { Match, Show, Suspense, Switch, createEffect } from "solid-js";
import { useAuth } from "../../../components/Auth";
import { Combobox, Select, TextField } from "@kobalte/core";
import { createQuery } from "@tanstack/solid-query";
import { Queries } from "../../../utils/api/queries";

const ProfileSettings = () => {
  const [auth] = useAuth();

  const companies = createQuery(() => ({
    queryKey: ["companies"],
    queryFn: async () => {
      const token = auth.token;
      if (!token) {
        return Promise.reject("No token");
      }
      return Queries.Companies.all(token);
    },
    get enabled() {
      const token = auth.token;
      return auth.isAuthenticated && !!token;
    },
    staleTime: Infinity,
  }));

  createEffect(() => {
    document.title = "Settings";
  });

  return (
    <Suspense fallback={<div></div>}>
      <Switch fallback={<div>You are not logged in</div>}>
        <Match when={auth.isAuthenticated && auth.user}>
          {(u) => (
            <div class="flex flex-col w-full max-w-[600px] mx-auto gap-16 py-10 px-2">
              <div class="flex flex-col w-full items-center justify-center gap-4">
                <div class="flex flex-col gap-2 rounded-full overflow-clip border-2 border-black dark:border-white w-20 h-20 bg-neutral-200 dark:bg-neutral-800">
                  <img class="w-full h-full" src={u().profile.image} alt="User Profile Image" />
                </div>
                <div class="flex flex-col gap-1 items-center justify-center">
                  <div class="flex flex-col font-bold">{u().name}</div>
                  <div class="flex flex-col font-medium text-sm">{u().email}</div>
                </div>
              </div>
              <form
                class="flex flex-col w-full gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div
                  class="flex flex-col gap-2 w-full border border-neutral-300 dark:border-neutral-800 rounded-md p-4 shadow-sm"
                  id="profile"
                >
                  <TextField.Root class="flex flex-col gap-1 w-full">
                    <TextField.Label class="text-sm font-medium">Name</TextField.Label>
                    <TextField.Input
                      class="bg-neutral-100 dark:bg-neutral-900 px-3 py-2 rounded-md w-full"
                      value={u().name}
                    />
                    <TextField.Description class="text-xs">Your name is public</TextField.Description>
                  </TextField.Root>
                  <TextField.Root class="flex flex-col gap-1">
                    <TextField.Label class="text-sm font-medium">Email</TextField.Label>
                    <TextField.Input
                      class="bg-neutral-100 dark:bg-neutral-900 px-3 py-2 rounded-md w-full"
                      value={u().email}
                    />
                    <TextField.Description class="text-xs">
                      Your email is private and is used for login
                    </TextField.Description>
                  </TextField.Root>
                  <button
                    type="button"
                    class="flex flex-row items-center gap-2 justify-center rounded-md px-2 py-1 bg-emerald-500 dark:bg-emerald-700 text-white border border-emerald-600 dark:border-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={u().emailVerified}
                  >
                    <Switch>
                      <Match when={u().emailVerified}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M18 6 7 17l-5-5" />
                          <path d="m22 10-7.5 7.5L13 16" />
                        </svg>
                        <span class="text-xs">Email Verified</span>
                      </Match>
                      <Match when={!u().emailVerified}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          <path d="M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
                          <path d="M20 22v.01" />
                        </svg>
                        <span class="text-xs">Verify Email</span>
                      </Match>
                    </Switch>
                  </button>
                </div>
                <div
                  class="flex flex-col gap-4 w-full border border-neutral-300 dark:border-neutral-800 rounded-md p-4 shadow-sm"
                  id="company"
                >
                  <Suspense
                    fallback={
                      <div>
                        <span class="animate-pulse">Loading Companies</span>
                      </div>
                    }
                  >
                    <Switch>
                      <Match when={companies.isFetched && companies.data}>
                        {(cs) => (
                          <Combobox.Root
                            disabled={u().companyId !== null}
                            class="flex w-max flex-col gap-2"
                            value={u().company}
                            options={cs()}
                            optionValue="id"
                            optionLabel={(c) => c.name}
                            optionTextValue={(c) => c.name}
                            placeholder="Select your company"
                            onChange={(v) => {
                              if (!v) return;
                              console.log(v.id);
                            }}
                            itemComponent={(props) => (
                              <Combobox.Item
                                item={props.item}
                                class="flex flex-row gap-2 items-center justify-start px-2 py-1"
                              >
                                <Show when={props.item.rawValue?.id !== u().companyId}>
                                  <div class="w-[14px] h-[14px]"></div>
                                </Show>
                                <Combobox.ItemIndicator>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="lucide lucide-check"
                                  >
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                </Combobox.ItemIndicator>
                                <Combobox.ItemLabel class="text-xs">{props.item.textValue}</Combobox.ItemLabel>
                              </Combobox.Item>
                            )}
                          >
                            <Combobox.Label class="text-sm">
                              Company <span class="text-xs">{u().companyId !== null ? "(selected)" : ""}</span>
                            </Combobox.Label>
                            <Combobox.Control class="flex flex-row items-center bg-transparent gap-2 border border-black/5 dark:border-white/5 rounded-md disabled:opacity-50">
                              <Combobox.Input class="flex flex-row items-center bg-transparent px-2 text-sm py-1 disabled:opacity-50" />
                              <Combobox.Trigger class="px-2 py-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </Combobox.Trigger>
                            </Combobox.Control>
                            <Combobox.Portal>
                              <Combobox.Content class="self-end mt-2 bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                                <Combobox.Listbox />
                              </Combobox.Content>
                            </Combobox.Portal>
                          </Combobox.Root>
                        )}
                      </Match>
                    </Switch>
                  </Suspense>
                  <div class="w-full flex flex-row items-center justify-between">
                    <div class="flex flex-row w-max gap-2">
                      <button
                        type="button"
                        class="flex flex-row items-center gap-2 justify-center rounded-md px-2 py-1 bg-emerald-500 dark:bg-emerald-700 text-white border border-emerald-600 dark:border-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={u().companyId !== null}
                      >
                        <Switch>
                          <Match when={u().companyId === null}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M18 6 7 17l-5-5" />
                              <path d="m22 10-7.5 7.5L13 16" />
                            </svg>
                            <span class="text-xs">Request Company Seat</span>
                          </Match>
                          <Match when={u().companyId !== null}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              <path d="M18 15.28c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
                              <path d="M20 22v.01" />
                            </svg>
                            <span class="text-xs">Company Seat Set</span>
                          </Match>
                        </Switch>
                      </button>
                    </div>
                    <div class="flex flex-row w-max gap-2">
                      <button
                        class="flex flex-row w-max items-center gap-2 justify-center rounded-md px-2 py-1 bg-red-500 dark:bg-red-700 text-white border border-red-600 dark:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          console.log("disconnect");
                        }}
                        disabled={u().companyId === null}
                      >
                        <span class="text-xs">Disconnect</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="flex flex-row gap-2 items-center justify-between w-full">
                  <div class="flex flex-row items-center gap-2"></div>
                  <div class="flex flex-row items-center gap-2 w-max">
                    <button
                      class="w-max flex flex-row items-center gap-2 justify-center rounded-md px-2 py-1 bg-emerald-500 dark:bg-emerald-700 text-white border border-emerald-600 dark:border-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                    >
                      <span class="text-xs">Save</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </Match>
      </Switch>
    </Suspense>
  );
};

export default ProfileSettings;
