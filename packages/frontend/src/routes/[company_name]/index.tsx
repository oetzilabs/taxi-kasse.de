import { A } from "@solidjs/router";
import dayjs from "dayjs";
import { For, Show, createEffect, createSignal } from "solid-js";
import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

type Currency = "CHF" | "EUR" | "USD";
type DistanceUnit = "km" | "mi";

type MockData = {
  currency: Currency;
  distance: DistanceUnit;
  number: string;
  locale: string;
  months: {
    [key in Month]?: {
      total: number;
      entries: {
        id: string;
        date: Date;
        fields: {
          total: {
            type: "distance";
            value: number;
          };
          taken: {
            type: "distance";
            value: number;
          };
          tour: {
            type: "currency";
            value: number;
          };
          cash: {
            type: "number";
            value: number;
          };
        };
      }[];
    };
  };
};

const fillMonth = (month: Month) => {
  const months = Array.from(
    new Set([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ])
  );

  const monthIndex = months.indexOf(month);
  if (monthIndex === -1) throw new Error("Invalid month");
  const theMonth = dayjs().month(monthIndex);
  const days = theMonth.daysInMonth();
  return Array.from({ length: days }, (_, i) => ({
    id: Math.random().toString(),
    date: theMonth.startOf("month").add(i, "day").toDate(),
    fields: {
      total: {
        type: "distance",
        value: Math.floor(Math.random() * 100),
      },
      taken: {
        type: "distance",
        value: Math.floor(Math.random() * 100),
      },
      tour: {
        type: "number",
        value: Math.floor(Math.random() * 20),
      },
      cash: {
        type: "currency",
        value: Math.floor(Math.random() * 10000),
      },
    },
  })).sort((a, b) => dayjs(a.date).diff(b.date));
};

const fillYear = () => {
  const months: Set<Month> = new Set([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
  ]);
  return [...months].reduce((acc, month) => {
    const entries = fillMonth(month);
    let total = 0;
    for (const m of entries) {
      total += m.fields.cash.value;
    }
    return {
      ...acc,
      [month]: {
        total,
        entries,
      },
    };
  }, {});
};

export function routeData({ params }: RouteDataArgs) {
  const { company_name } = params;
  const rd = createServerData$(
    async ([companyName]) => {
      const mockData: MockData = {
        number: "",
        currency: "CHF",
        distance: "km",
        locale: "de-CH",
        months: fillYear(),
      };
      return {
        company: {
          name: companyName,
          page: companyName,
          data: mockData,
        },
        lastUpdated: new Date(),
      };
    },
    {
      key: [company_name],
    }
  );
  return rd;
}

export default function CompanyPage() {
  // const { company_name } = useParams();
  const data = useRouteData<typeof routeData>();
  const [cuDate, setDate] = createSignal(dayjs().toDate());
  const [user, setUser] = createSignal({ username: "testuser" });
  const cuMonth = () => dayjs(cuDate()).format("MMMM") as Month;

  return (
    <div class="relative container mx-auto flex flex-col gap-2 py-[49px]">
      <div class="w-full h-screen px-8">
        <Show when={data() && data()} fallback={<div class="flex justify-center items-center p-10">Loading...</div>}>
          {(d) => (
            <div class="w-full h-auto flex-col relative justify-start items-start flex gap-4">
              <div class="w-full flex flex-col bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-900 z-40 sticky top-[49px]">
                <div class="self-stretch py-4 justify-between items-center inline-flex">
                  <div class="justify-start items-end gap-2 flex">
                    <A href={`/${d().company.page}`} class="opacity-40 hover:opacity-60 text-2xl font-semibold">
                      {d().company.name}
                    </A>
                    <div class="text-xl font-bold">/</div>
                    <div class="text-xl font-normal">{user().username}</div>
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
                        setDate((md) => dayjs(md).subtract(1, "month").toDate());
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
                        setDate((md) => dayjs(md).add(1, "month").toDate());
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
                    <div class="text-xl font-bold">{dayjs(cuDate()).format("MMMM YYYY")}</div>
                  </div>
                  <div class="justify-start items-center gap-2.5 flex">
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
                <Show when={d().company.data.months[cuMonth()]?.entries.length === 0}>
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
                      <button class="p-1.5 px-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black">
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
                <Show when={(d().company.data.months[cuMonth()]?.entries.length ?? 0) > 0}>
                  <div class="flex flex-col gap-2 items-center justify-center w-full">
                    <For each={d().company.data.months[cuMonth()]?.entries}>
                      {(entry) => (
                        <div class="flex flex-col gap-2 w-full p-2 last:border-none border-b border-neutral-200 dark:border-neutral-800">
                          <div class="flex w-full justify-between">
                            <div class="font-medium">{dayjs(entry.date).format("Do MMM. YYYY")}</div>
                            <div class="">
                              {entry.fields.total.value} {d().company.data[entry.fields.total.type]}
                            </div>
                          </div>
                          <div class="flex w-full justify-between">
                            <div class="font-medium">
                              {entry.fields.taken.value} {d().company.data[entry.fields.taken.type]}
                            </div>
                            <div class="font-bold">
                              {new Intl.NumberFormat(d().company.data.locale).format(entry.fields.cash.value ?? 0)}{" "}
                              {d().company.data[entry.fields.cash.type]}
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
              <div class="w-full flex flex-col opacity-70 items-center justify-center text-xs gap-2">
                Last updated {dayjs(d().lastUpdated).format("Do MMM. YYYY, HH:mm:ss")}
                <button class="text-md font-medium cursor-pointer flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-sm border border-black dark:border-white !border-opacity-10 p-1.5 px-2 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 active:bg-black active:bg-opacity-10 dark:active:bg-white dark:active:bg-opacity-10">
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
                        <span>
                          {new Intl.NumberFormat(d().company.data.locale).format(
                            d().company.data.months[cuMonth()]?.total ?? 0
                          )}
                        </span>
                        <span>{d().company.data.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
