import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { For, Match, Show, Suspense, Switch, createEffect, createSignal } from "solid-js";
import { createIdleTimer } from "@solid-primitives/idle";
import toast from "solid-toast";
import { useAuth } from "../../../components/Auth";
import { Modal } from "../../../components/Modal";
import { Mutations } from "../../../utils/api/mutations";
import { Queries } from "../../../utils/api/queries";
import { Button } from "../../../components/Button";
import { CreateEntryModal, EditEntryModal } from "../../../components/EntryModal";
dayjs.extend(advancedFormat);

const Modes = {
  EDIT: "EDIT",
  CREATE: "CREATE",
} as const;

type CalendarWrapperProps = {
  user: {
    token: string;
    name: string;
  };
  company: {
    id: string;
    name: string;
  };
  locale: string;
};

function FakeProgressBar(props: { time: number }) {
  const [progress, setProgress] = createSignal(0);
  createEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => p + 1);
    }, props.time / 100);
    return () => clearInterval(interval);
  });
  return (
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
      <div
        class="h-full bg-black dark:bg-white/50"
        style={{
          width: `${progress()}%`,
        }}
      ></div>
    </div>
  );
}

function CalendarWrapper(props: CalendarWrapperProps) {
  const [range, setRange] = createSignal({
    from: dayjs().startOf("month").toDate(),
    to: dayjs().endOf("month").toDate(),
  });
  const [modalOpen, setModalOpen] = createSignal(false);

  const queryClient = useQueryClient();

  const [entryData, setEntryData] = createSignal<
    | {
        mode: "CREATE";
        date: Date;
        distance: number;
        driven_distance: number;
        tour_count: number;
        cash: number;
      }
    | {
        mode: "EDIT";
        id: string;
        date: Date;
        distance: number;
        driven_distance: number;
        tour_count: number;
        cash: number;
      }
  >({
    mode: "CREATE",
    date: new Date(),
    distance: 0,
    driven_distance: 0,
    tour_count: 0,
    cash: 0,
  });

  const { isIdle, isPrompted, reset } = createIdleTimer({
    idleTimeout: 60_000,
  });

  const calendar = createQuery(
    () => ["calendar", props.user.token, range().from.toISOString(), range().to.toISOString()],
    () => {
      return Queries.calendar(props.user.token, range());
    },
    {
      get enabled() {
        return !modalOpen() && !isIdle();
      },
      refetchInterval: 10_000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const deleteEntry = createMutation(
    (id: string) => {
      const payload = {
        id,
      } as Parameters<typeof Mutations.deleteDayEntry>[1];
      return Mutations.deleteDayEntry(props.user.token, payload);
    },
    {
      onSuccess: (entry) => {
        if (entry.success) {
          queryClient.invalidateQueries(["calendar"]);
          toast.success(`Entry ${dayjs(entry.entry.date).format("Do MMM YYYY")} deleted`);
        }
      },
      onError: (err) => {
        toast.error("Entry not deleted");
      },
    }
  );

  const confirmDelete = (id: string) => {
    toast.custom(
      <div class="relative overflow-clip flex flex-col border border-black/10 dark:border-white/10 rounded-md p-4 gap-4 shadow-sm">
        <span class="font-bold">Are you sure?</span>
        <div class="flex flex-row gap-2">
          <button
            class="p-1.5 px-2.5 bg-red-100 dark:bg-red-900 rounded-md border border-black/10 dark:border-white/10 justify-center items-center gap-2.5 flex cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 active:bg-red-300 dark:active:bg-red-700"
            onClick={async () => {
              await deleteEntry.mutateAsync(id);
            }}
          >
            <span>Yes, delete</span>
          </button>
          <button
            class="p-1.5 px-2.5 bg-white dark:bg-black rounded-md border border-black/10 dark:border-white/10 justify-center items-center gap-2.5 flex cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950 active:bg-neutral-100 dark:active:bg-neutral-900"
            onClick={async () => {
              toast.dismiss();
            }}
          >
            <span>No</span>
          </button>
        </div>
        <FakeProgressBar time={3000} />
      </div>,
      {
        duration: 3000,
        position: "bottom-right",
      }
    );
  };

  const calculatedTotal = () => {
    let total = 0;
    for (const entry of calendar.data?.calendar ?? []) {
      total += entry.cash;
    }
    return total;
  };

  return (
    <div class="container mx-auto flex flex-col gap-2">
      <div class="w-full h-screen px-8">
        <Suspense fallback={<div class="flex justify-center items-center p-10">Loading...</div>}>
          <div class="w-full h-auto flex-col relative justify-start items-start flex gap-2">
            <div class="w-full flex flex-col bg-white dark:bg-black">
              <div class="self-stretch py-4 justify-between items-center inline-flex">
                <div class="justify-start items-end gap-2 flex text-xl font-semibold">{props.company.name}</div>
                <div class="justify-end items-center gap-2.5 flex">
                  <button
                    disabled
                    class="p-2 bg-white dark:bg-black rounded-md border border-black/10 dark:border-white/10 justify-center items-center gap-2.5 flex cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950 active:bg-neutral-100 dark:active:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                      <path
                        d="M8.14667 1.83334H7.85333C7.49971 1.83334 7.16057 1.97382 6.91053 2.22387C6.66048 2.47392 6.52 2.81305 6.52 3.16668V3.28668C6.51976 3.52049 6.45804 3.75014 6.34103 3.95257C6.22401 4.155 6.05583 4.3231 5.85333 4.44001L5.56667 4.60668C5.36398 4.7237 5.13405 4.78531 4.9 4.78531C4.66595 4.78531 4.43603 4.7237 4.23333 4.60668L4.13333 4.55334C3.82738 4.37685 3.46389 4.32897 3.12267 4.42022C2.78145 4.51146 2.49037 4.73437 2.31333 5.04001L2.16667 5.29334C1.99018 5.5993 1.9423 5.96279 2.03354 6.30401C2.12478 6.64523 2.34769 6.93631 2.65333 7.11334L2.75333 7.18001C2.95485 7.29635 3.12241 7.4634 3.23937 7.66456C3.35632 7.86573 3.4186 8.09399 3.42 8.32668V8.66668C3.42093 8.90162 3.35977 9.13264 3.2427 9.33635C3.12563 9.54005 2.95681 9.7092 2.75333 9.82668L2.65333 9.88668C2.34769 10.0637 2.12478 10.3548 2.03354 10.696C1.9423 11.0372 1.99018 11.4007 2.16667 11.7067L2.31333 11.96C2.49037 12.2657 2.78145 12.4886 3.12267 12.5798C3.46389 12.671 3.82738 12.6232 4.13333 12.4467L4.23333 12.3933C4.43603 12.2763 4.66595 12.2147 4.9 12.2147C5.13405 12.2147 5.36398 12.2763 5.56667 12.3933L5.85333 12.56C6.05583 12.6769 6.22401 12.845 6.34103 13.0475C6.45804 13.2499 6.51976 13.4795 6.52 13.7133V13.8333C6.52 14.187 6.66048 14.5261 6.91053 14.7762C7.16057 15.0262 7.49971 15.1667 7.85333 15.1667H8.14667C8.50029 15.1667 8.83943 15.0262 9.08948 14.7762C9.33953 14.5261 9.48 14.187 9.48 13.8333V13.7133C9.48024 13.4795 9.54196 13.2499 9.65898 13.0475C9.77599 12.845 9.94418 12.6769 10.1467 12.56L10.4333 12.3933C10.636 12.2763 10.866 12.2147 11.1 12.2147C11.3341 12.2147 11.564 12.2763 11.7667 12.3933L11.8667 12.4467C12.1726 12.6232 12.5361 12.671 12.8773 12.5798C13.2186 12.4886 13.5096 12.2657 13.6867 11.96L13.8333 11.7C14.0098 11.3941 14.0577 11.0306 13.9665 10.6893C13.8752 10.3481 13.6523 10.057 13.3467 9.88001L13.2467 9.82668C13.0432 9.7092 12.8744 9.54005 12.7573 9.33635C12.6402 9.13264 12.5791 8.90162 12.58 8.66668V8.33334C12.5791 8.0984 12.6402 7.86737 12.7573 7.66367C12.8744 7.45997 13.0432 7.29082 13.2467 7.17334L13.3467 7.11334C13.6523 6.93631 13.8752 6.64523 13.9665 6.30401C14.0577 5.96279 14.0098 5.5993 13.8333 5.29334L13.6867 5.04001C13.5096 4.73437 13.2186 4.51146 12.8773 4.42022C12.5361 4.32897 12.1726 4.37685 11.8667 4.55334L11.7667 4.60668C11.564 4.7237 11.3341 4.78531 11.1 4.78531C10.866 4.78531 10.636 4.7237 10.4333 4.60668L10.1467 4.44001C9.94418 4.3231 9.77599 4.155 9.65898 3.95257C9.54196 3.75014 9.48024 3.52049 9.48 3.28668V3.16668C9.48 2.81305 9.33953 2.47392 9.08948 2.22387C8.83943 1.97382 8.50029 1.83334 8.14667 1.83334Z"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="self-stretch py-5 justify-between items-center inline-flex">
                <div class="justify-start items-center gap-2.5 flex">
                  <CreateEntryModal token={props.user.token}>
                    <Button.Ghost aria-label="add entry">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      <span class="font-bold select-none">Add Entry</span>
                    </Button.Ghost>
                  </CreateEntryModal>
                </div>
                <div class="justify-start items-center gap-2.5 flex">
                  <div class="flex flex-row gap-2 border border-black/10 dark:border-white/10 rounded-md overflow-clip">
                    <Button.Ghost
                      class="flex items-center !rounded-none justify-center p-2"
                      onClick={async () => {
                        setRange((md) => ({
                          from: dayjs(md.from).subtract(1, "month").startOf("month").toDate(),
                          to: dayjs(md.to).subtract(1, "month").toDate(),
                        }));
                        await queryClient.invalidateQueries(["calendar"]);
                      }}
                      aria-label="Previous month"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                      </svg>
                    </Button.Ghost>
                    <div class="flex w-fit items-center justify-center">
                      <div class="font-bold w-fit text-center select-none">
                        {dayjs(range().from).format("MMMM YYYY")}
                      </div>
                    </div>
                    <Button.Ghost
                      class="flex items-center !rounded-none justify-center p-2"
                      onClick={async () => {
                        setRange((md) => ({
                          from: dayjs(md.from).add(1, "month").startOf("month").toDate(),
                          to: dayjs(md.to).add(1, "month").toDate(),
                        }));

                        await queryClient.invalidateQueries(["calendar"]);
                      }}
                      aria-label="Next month"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Button.Ghost>
                  </div>
                  <div class="flex gap-2">
                    <Button.Secondary aria-label="share">
                      <div class="w-4 h-4 relative text-black dark:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                          <path
                            d="M10 11.8333L13.3333 8.49999L10 5.16666"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M2.66666 12.5V11.1667C2.66666 10.4594 2.94761 9.78115 3.4477 9.28105C3.9478 8.78095 4.62608 8.5 5.33332 8.5H13.3333"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                      <div class="select-none text-base font-bold">Share</div>
                    </Button.Secondary>
                    <Button.Secondary aria-label="reports menu">
                      <div class="w-4 h-4 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                          <path
                            d="M9.66666 1.83334H3.99999C3.64637 1.83334 3.30723 1.97382 3.05718 2.22387C2.80713 2.47392 2.66666 2.81305 2.66666 3.16668V13.8333C2.66666 14.187 2.80713 14.5261 3.05718 14.7762C3.30723 15.0262 3.64637 15.1667 3.99999 15.1667H12C12.3536 15.1667 12.6928 15.0262 12.9428 14.7762C13.1928 14.5261 13.3333 14.187 13.3333 13.8333V5.50001L9.66666 1.83334Z"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M9.33331 1.83334V5.83334H13.3333"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M10.6666 9.16666H5.33331"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M10.6666 11.8333H5.33331"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M6.66665 6.5H5.33331"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                      <div class="select-none text-base font-bold">Reports</div>
                    </Button.Secondary>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex w-full flex-grow relative bg-neutral-50 dark:bg-neutral-950 rounded-md border border-black/[0.03] dark:border-white/[0.03]">
              <Show when={(calendar.data?.calendar ?? []).length === 0}>
                <div class="flex flex-col gap-4 items-center justify-center w-full h-full p-40">
                  <div class="opacity-25 flex flex-col items-center justify-center gap-2] -rotate-[10deg]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="8" cy="8" r="6" />
                      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                      <path d="M7 6h1v4" />
                      <path d="m16.71 13.88.7.71-2.82 2.82" />
                    </svg>
                  </div>
                  <div class="text-neutral-500 select-none">There is no data for this month.</div>
                  <div class="flex flex-col items-center justify-center gap-6">
                    <CreateEntryModal token={props.user.token}>
                      <Button.Primary aria-label="add entry">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        Add entry
                      </Button.Primary>
                    </CreateEntryModal>
                  </div>
                </div>
              </Show>
              <Show when={(calendar.data?.calendar ?? []).length > 0}>
                <div class="flex flex-col gap-2 items-center justify-center w-full">
                  <For each={calendar.data?.calendar ?? []}>
                    {(entry) => (
                      <div class="flex flex-col gap-2 w-full p-4 last:border-none border-b border-neutral-100 dark:border-neutral-900">
                        <div class="flex w-full justify-between">
                          <div class="w-fit flex flex-row gap-2">
                            <div class="font-medium">{dayjs(entry.date).format("Do MMM. YYYY")}</div>
                            <div class="flex flex-row gap-2">
                              <EditEntryModal date={entry.date} token={props.user.token} entry={entry}>
                                <Button.Icon>
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
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button.Icon>
                              </EditEntryModal>
                              <Button.Icon
                                danger
                                ghost
                                class="p-2 rounded-md hover:bg-red-100 hover:dark:bg-red-900"
                                onClick={() => {
                                  confirmDelete(entry.id);
                                }}
                              >
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
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </Button.Icon>
                            </div>
                          </div>
                          <div class="">{entry.total_distance} km</div>
                        </div>
                        <div class="flex w-full justify-between">
                          <div class="font-medium">{entry.driven_distance} km</div>
                          <div class="font-bold">{new Intl.NumberFormat(props.locale).format(entry.cash)} CHF</div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
            <div class="flex w-full py-4">
              <div class="flex items-center justify-between flex-wrap container mx-auto px-2">
                <div class="justify-start items-center gap-2.5 flex">
                  <div class="text-xl font-semibold">Total</div>
                </div>
                <div class="justify-end items-center gap-2.5 flex w-max">
                  <div class="justify-center items-center gap-2.5 flex">
                    <div class="text-xl font-semibold flex gap-2">
                      <span>{new Intl.NumberFormat(props.locale).format(calculatedTotal())}</span>
                      <span>CHF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full flex flex-col items-center justify-center text-xs gap-6 py-8">
              <span class="opacity-40 select-none">
                Last updated {dayjs(calendar.data?.lastUpdated).format("Do MMM. YYYY, HH:mm:ss")}
              </span>
              <Button.Secondary
                class="py-1.5 gap-2.5 flex cursor-pointer"
                onClick={async () => {
                  await queryClient.invalidateQueries(["calendar"]);
                }}
                aria-label="refresh"
              >
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
                  class={calendar.isFetching ? "animate-spin" : ""}
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                <span class="select-none">Refresh</span>
              </Button.Secondary>
            </div>
            <div class="w-full flex flex-col text-opacity-50 items-center justify-center h-[200px]"></div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export default function CompanyPage() {
  // const { company_name } = useParams();
  const [user] = useAuth();
  return (
    <Show when={user() && user()}>
      {(u) => (
        <Show when={u().token && u().token}>
          {(t) => (
            <CalendarWrapper
              user={{
                token: t(),
                name: u().user?.name ?? "",
              }}
              company={{ id: u().user?.company?.id ?? "", name: u().user?.company?.name ?? "" }}
              locale={u().user?.profile.locale ?? "en"}
            />
          )}
        </Show>
      )}
    </Show>
  );
}
