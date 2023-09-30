import { A } from "@solidjs/router";
import dayjs from "dayjs";
import { For, Show, createEffect, createSignal } from "solid-js";
import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useAuth } from "../../../components/Auth";
import { API } from "../../../utils/api";
import { Portal } from "solid-js/web";
dayjs.extend(advancedFormat);

const Modes = {
  EDIT: "EDIT",
  CREATE: "CREATE",
} as const;

type CalendarProps = {
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

function Calendar(props: CalendarProps) {
  const [mode, setMode] = createSignal<keyof typeof Modes>(Modes.CREATE);
  const [calendar, setCalendar] = createSignal<
    Awaited<ReturnType<typeof API.calendar>> & {
      lastUpdated: Date;
    }
  >();
  const [from, setFrom] = createSignal(dayjs().startOf("month").toDate());
  const [to, setTo] = createSignal(dayjs().endOf("month").toDate());
  createEffect(async () => {
    const response = await API.calendar(props.user.token, {
      from: from(),
      to: to(),
    });
    setCalendar({ ...response, lastUpdated: new Date() });
  });

  const dataRefresh = async () => {
    const newData = await API.calendar(props.user.token, {
      from: from(),
      to: to(),
    });
    setCalendar({ ...newData, lastUpdated: new Date() });
  };

  const [newEntryOpen, setNewEntryOpen] = createSignal(false);

  const [newEntryState, createEntry] = createServerAction$(
    async (
      params: {
        token: string;
        date: Date;
        distance: number;
        driven_distance: number;
        tour_count: number;
        cash: number;
      },
      { request }
    ) => {
      const entry = await API.createDayEntry(params.token, {
        date: dayjs(params.date).toDate(),
        total_distance: params.distance,
        driven_distance: params.driven_distance,
        cash: params.cash,
        tour_count: params.tour_count,
      });
      console.log(entry);
    }
  );

  const [updateEntryState, updateEntry] = createServerAction$(
    async (
      params: {
        id: string;
        token: string;
        distance: number;
        driven_distance: number;
        tour_count: number;
        cash: number;
      },
      { request }
    ) => {
      await API.updateDayEntry(params.token, {
        id: params.id,
        total_distance: params.distance,
        driven_distance: params.driven_distance,
        cash: params.cash,
        tour_count: params.tour_count,
      });
    }
  );

  const [editDayId, setEditDayId] = createSignal<string | null>(null);

  const [newEntryData, setNewEntryData] = createSignal<{
    date: Date;
    distance: number;
    driven_distance: number;
    tour_count: number;
    cash: number;
  }>({
    date: new Date(),
    distance: 0,
    driven_distance: 0,
    tour_count: 0,
    cash: 0,
  });

  createEffect(() => {
    // keybind for closing the modal
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNewEntryOpen(false);
        setEditDayId(null);
        setMode(Modes.CREATE);
        setNewEntryData({
          date: new Date(),
          distance: 0,
          driven_distance: 0,
          tour_count: 0,
          cash: 0,
        });
      }
    };
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  });

  return (
    <div class="relative container mx-auto flex flex-col gap-2">
      <div class="w-full h-screen px-8">
        <Show
          when={calendar() && calendar()}
          fallback={<div class="flex justify-center items-center p-10">Loading...</div>}
        >
          {(d) => (
            <div class="w-full h-auto flex-col relative justify-start items-start flex gap-4">
              <div class="w-full flex flex-col bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-900 z-40 sticky top-[49px]">
                <div class="self-stretch py-4 justify-between items-center inline-flex">
                  <div class="justify-start items-end gap-2 flex">
                    <A href={`/company/${props.company.id}`} class="opacity-40 hover:opacity-60 text-2xl font-semibold">
                      {props.company.name}
                    </A>
                    <div class="text-xl font-bold">/</div>
                    <div class="text-xl font-normal">{props.user.name}</div>
                  </div>
                  <div class="justify-end items-center gap-2.5 flex">
                    <button
                      class="p-2 bg-neutral-900 dark:bg-neutral-50 rounded-sm border border-black border-opacity-10 justify-center items-center gap-2.5 flex cursor-pointer relative text-white dark:text-black"
                      aria-label="Settings"
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
                    <button
                      class="p-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                      onClick={() => {
                        setFrom((md) => dayjs(md).subtract(1, "month").toDate());
                        setTo((md) => dayjs(md).subtract(1, "month").endOf("month").toDate());
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
                    </button>
                    <button
                      class="p-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                      onClick={() => {
                        setFrom((md) => dayjs(md).add(1, "month").toDate());
                        setTo((md) => dayjs(md).add(1, "month").endOf("month").toDate());
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
                    </button>
                    <div class="text-xl font-bold truncate">{dayjs(from()).format("MMMM YYYY")}</div>
                  </div>
                  <div class="justify-start items-center gap-2.5 flex">
                    <button
                      class="p-1.5 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                      aria-label="add entry"
                      onClick={() => setNewEntryOpen(true)}
                    >
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
                      {/* <div class="select-none text-base font-bold">Add Entry</div> */}
                    </button>
                    <button
                      class="p-1 px-2 bg-white dark:bg-black rounded-sm border border-black dark:border-white !border-opacity-10 justify-center items-center gap-2.5 flex cursor-pointer hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
                      aria-label="share"
                    >
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
                    </button>
                    <button
                      class="p-1 px-2 bg-white dark:bg-black rounded-sm border border-black !border-opacity-10 dark:border-white justify-center items-center gap-2.5 flex cursor-pointer hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
                      aria-label="reports menu"
                    >
                      <div class="w-4 h-4 relative text-black dark:text-white">
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
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex w-full flex-grow relative bg-white rounded-sm border border-black dark:border-white dark:bg-black !border-opacity-10">
                <Show when={(d()?.calendar ?? []).length === 0}>
                  <div class="flex flex-col gap-2 items-center justify-center w-full h-full p-20">
                    <div class="opacity-10 flex flex-col items-center justify-center gap-2">
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
                    <div class="flex flex-col items-center justify-center gap-4">
                      <div class="text-2xl font-medium opacity-25">No entries</div>
                      <button
                        class="p-1.5 px-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                        aria-label="Add entry"
                        onClick={() => setNewEntryOpen(true)}
                      >
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
                      </button>
                    </div>
                  </div>
                </Show>
                <Show when={(d()?.calendar ?? []).length > 0}>
                  <div class="flex flex-col gap-2 items-center justify-center w-full">
                    <For each={d()?.calendar ?? []}>
                      {(entry) => (
                        <div class="flex flex-col gap-2 w-full p-4 last:border-none border-b border-neutral-200 dark:border-neutral-800">
                          <div class="flex w-full justify-between">
                            <div class="w-fit flex flex-row gap-2">
                              <div class="font-medium">{dayjs(entry.date).format("Do MMM. YYYY")}</div>
                              <div class="flex flex-row gap-2">
                                <button
                                  class="p-2 rounded-sm hover:bg-neutral-100 hover:dark:bg-neutral-900"
                                  onClick={() => {
                                    setEditDayId(entry.id);
                                    setMode(Modes.EDIT);
                                    setNewEntryData({
                                      date: entry.date,
                                      distance: entry.total_distance,
                                      driven_distance: entry.driven_distance,
                                      tour_count: entry.tour_count,
                                      cash: entry.cash,
                                    });
                                    setNewEntryOpen(true);
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
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </button>
                                <button class="p-2 rounded-sm hover:bg-red-100 hover:dark:bg-red-900">
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
                                </button>
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
              <div class="w-full flex flex-col opacity-70 items-center justify-center text-xs gap-6 py-8">
                Last updated {dayjs(d().lastUpdated).format("Do MMM. YYYY, HH:mm:ss")}
                <button
                  class="text-md font-medium cursor-pointer flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-sm border border-black dark:border-white !border-opacity-10 p-1.5 px-2 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 active:bg-black active:bg-opacity-10 dark:active:bg-white dark:active:bg-opacity-10"
                  onClick={dataRefresh}
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
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
              <div class="w-full flex flex-col text-opacity-50 items-center justify-center h-[200px]"></div>
              <div class="left-0 bottom-0 fixed bg-neutral-100 dark:bg-neutral-900 w-screen py-0.5 border-t border-neutral-200 dark:border-neutral-800 justify-between items-center flex">
                <div class="flex items-center justify-between flex-wrap container mx-auto px-8">
                  <div class="justify-start items-center gap-2.5 flex">
                    <div class="text-xl font-bold">Total</div>
                  </div>
                  <div class="justify-end items-center gap-2.5 flex w-max">
                    <div class="p-2.5 justify-center items-center gap-2.5 flex">
                      <div class="text-xl font-bold flex gap-2">
                        <span>total</span>
                        <span>CHF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
        <Portal>
          <Show when={newEntryOpen()}>
            <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" />
            <div class="fixed flex flex-col top-[50%] left-[50%] transform  -translate-x-[50%] -translate-y-[50%] h-auto w-[400px] z-50 bg-white border border-neutral-200 shadow-md dark:bg-black dark:border-neutral-800 p-4 rounded-sm gap-4">
              <div class="flex flex-row w-full items-center justify-between">
                <h1 class="text-xl font-bold">New entry</h1>
                <button
                  class="p-2 border border-neutral-200 dark:border-neutral-800 rounded-md"
                  onClick={() => {
                    setMode(Modes.CREATE);
                    setNewEntryData({
                      date: new Date(),
                      distance: 0,
                      driven_distance: 0,
                      tour_count: 0,
                      cash: 0,
                    });
                    setNewEntryOpen(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div class="flex flex-col gap-2">
                <Show when={mode() === "EDIT"}>
                  <input type="hidden" name="id" value={editDayId()!} />
                </Show>
                <label class="flex flex-col gap-1">
                  <span>Date</span>
                  <input
                    type="date"
                    name="date"
                    value={dayjs(newEntryData().date).format("YYYY-MM-DD")}
                    onInput={(e) => {
                      setNewEntryData((d) => ({ ...d, date: dayjs(e.currentTarget.value).toDate() }));
                    }}
                    disabled={newEntryState.pending}
                    class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                  />
                </label>
                <label class="flex flex-col gap-1">
                  <span>Total Distance</span>
                  <input
                    type="number"
                    name="distance"
                    min="0"
                    step="0.01"
                    value={newEntryData().distance}
                    onInput={(e) => {
                      setNewEntryData((d) => ({ ...d, distance: parseFloat(e.currentTarget.value) }));
                    }}
                    disabled={newEntryState.pending}
                    class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                  />
                </label>
                <label class="flex flex-col gap-1">
                  <span>Driven distance</span>
                  <input
                    type="number"
                    name="driven_distance"
                    min="0"
                    step="0.01"
                    value={newEntryData().driven_distance}
                    onInput={(e) => {
                      setNewEntryData((d) => ({ ...d, driven_distance: parseFloat(e.currentTarget.value) }));
                    }}
                    disabled={newEntryState.pending}
                    class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                  />
                </label>
                <label class="flex flex-col gap-1">
                  <span>Price</span>
                  <input
                    type="number"
                    name="cash"
                    min="0"
                    step="0.01"
                    disabled={newEntryState.pending}
                    value={newEntryData().cash}
                    onInput={(e) => {
                      setNewEntryData((d) => ({ ...d, cash: parseFloat(e.currentTarget.value) }));
                    }}
                    class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                  />
                </label>
                <button
                  type="button"
                  disabled={newEntryState.pending}
                  class="w-full rounded-sm bg-black text-white py-2"
                  onClick={async () => {
                    if (mode() === Modes.CREATE) {
                      await createEntry({
                        ...newEntryData(),
                        token: props.user.token,
                      });
                    } else if (mode() === Modes.EDIT && editDayId() !== null) {
                      await updateEntry({
                        ...newEntryData(),
                        id: editDayId()!,
                        token: props.user.token,
                      });
                    }
                    await dataRefresh();
                    setNewEntryOpen(false);
                  }}
                >
                  {mode() === "CREATE" ? "Add" : "Save"} entry
                </button>
              </div>
            </div>
          </Show>
        </Portal>
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
            <Calendar
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
