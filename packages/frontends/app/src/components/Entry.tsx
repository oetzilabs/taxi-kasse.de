import dayjs from "dayjs";
import { Users } from "../utils/api/queries";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { Accessor, Match, Switch, createSignal } from "solid-js";
import { Popover, TextField } from "@kobalte/core";
import { cn } from "../utils/cn";
import { Modal } from "./Modal";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

/**
 * @todo: Create a calendar entry component.
 * Here the entry points are:
 * - cash
 * - total_km
 * - driven_km
 * - tour_count
 */

export const CalendarEntry = (props: {
  date: dayjs.Dayjs;
  hovered: Accessor<boolean>;
  entry?: Awaited<ReturnType<typeof Users.Calendar.get>>[number];
}) => {
  return (
    <div class={cn("flex flex-col gap-2 group w-full h-full items-stretch")}>
      <div class="p-4">{props.date.format("dddd Do MMM")}</div>
      <Switch>
        <Match when={props.entry}>
          <div class="flex flex-col gap-2 h-full">
            <div class="flex-1 w-full items-stretch"></div>
            <div class="p-4 w-full justify-between items-start inline-flex">
              <div class="justify-start items-start gap-1 flex">
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
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                <div class="text-xs font-medium">{props.entry?.tour_count}</div>
              </div>
              <div class="justify-end items-start gap-2.5 flex">
                <div class="text-xs font-medium">
                  {props.entry?.cash.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </div>
              </div>
            </div>
          </div>
        </Match>
        <Match when={!props.entry}>
          <div class="flex flex-col gap-2 h-full">
            <div class="flex flex-1 w-full"></div>
            <Modal
              trigger={
                <div class="flex flex-row gap-2 p-4 group-hover:visible invisible items-center border-t border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900">
                  <div>
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
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </div>
                  <div class="text-sm">Create Entry</div>
                </div>
              }
              title="Create Entry"
            >
              <div class="flex flex-col gap-2">
                <form class="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                  <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-4">
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Cash</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Total KM</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Driven KM</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Tour Count</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                    </div>
                  </div>
                  <div class="flex flex-row gap-2 items-center justify-between">
                    <div class="flex flex-col gap-2"></div>
                    <div class="flex flex-col gap-2">
                      <button
                        type="submit"
                        class="px-2 py-1 text-sm border border-neutral-200 dark:border-[#121212] rounded-md bg-emerald-600 text-white"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export const CalendarMonthEntry = (props: {
  date: dayjs.Dayjs;
  hovered: Accessor<boolean>;
  entry?: Awaited<ReturnType<typeof Users.Calendar.get>>[number];
}) => {
  return (
    <div class={cn("flex flex-col gap-2 group w-full h-full items-stretch")}>
      <div class="p-4">{props.date.format("MMMM YYYY")}</div>
      <Switch>
        <Match when={props.entry}>
          <div class="flex flex-col gap-2 h-full">
            <div class="flex-1 w-full items-stretch"></div>
            <div class="p-4 w-full justify-between items-start inline-flex">
              <div class="justify-start items-start gap-1 flex">
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
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                <div class="text-xs font-medium">{props.entry?.tour_count}</div>
              </div>
              <div class="justify-end items-start gap-2.5 flex">
                <div class="text-xs font-medium">
                  {props.entry?.cash.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </div>
              </div>
            </div>
          </div>
        </Match>
        <Match when={!props.entry}>
          <div class="flex flex-col gap-2 h-full">
            <div class="flex flex-1 w-full"></div>
            <Modal
              trigger={
                <div class="flex flex-row gap-2 p-4 group-hover:visible invisible items-center border-t border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900">
                  <div>
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
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </div>
                  <div class="text-sm">Create Entry</div>
                </div>
              }
              title="Create Entry"
            >
              <div class="flex flex-col gap-2">
                <form class="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                  <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-4">
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Cash</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Total KM</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Driven KM</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                      <TextField.Root class="flex flex-col gap-2">
                        <TextField.Label>Tour Count</TextField.Label>
                        <TextField.Input
                          class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                          type="number"
                        />
                      </TextField.Root>
                    </div>
                  </div>
                  <div class="flex flex-row gap-2 items-center justify-between">
                    <div class="flex flex-col gap-2"></div>
                    <div class="flex flex-col gap-2">
                      <button
                        type="submit"
                        class="px-2 py-1 text-sm border border-neutral-200 dark:border-[#121212] rounded-md bg-emerald-600 text-white"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </Match>
      </Switch>
    </div>
  );
};
