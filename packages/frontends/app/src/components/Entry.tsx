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
  const [popoverOpen, setPopoverOpen] = createSignal(false);
  return (
    <div class={cn("flex flex-col gap-2 group w-full h-full items-stretch")}>
      <div class="p-4">{props.date.format("dddd Do")}</div>
      <Switch>
        <Match when={props.entry}>
          <div class="flex flex-col gap-2 h-full">
            <div class="flex-1 w-full items-stretch"></div>
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
                      <div class="flex flex-col gap-2">
                        <TextField.Root class="flex flex-col gap-2">
                          <TextField.Label>Cash</TextField.Label>
                          <TextField.Input
                            class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                            type="number"
                          />
                        </TextField.Root>
                      </div>
                      <div class="flex flex-col gap-2">
                        <TextField.Root class="flex flex-col gap-2">
                          <TextField.Label>Total KM</TextField.Label>
                          <TextField.Input
                            class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                            type="number"
                          />
                        </TextField.Root>
                      </div>
                      <div class="flex flex-col gap-2">
                        <TextField.Root class="flex flex-col gap-2">
                          <TextField.Label>Driven KM</TextField.Label>
                          <TextField.Input
                            class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                            type="number"
                          />
                        </TextField.Root>
                      </div>
                      <div class="flex flex-col gap-2">
                        <TextField.Root class="flex flex-col gap-2">
                          <TextField.Label>Tour Count</TextField.Label>
                          <TextField.Input
                            class="p-2 bg-neutral-300 dark:bg-neutral-800 border border-neutral-200 dark:border-[#121212] rounded-md"
                            type="number"
                          />
                        </TextField.Root>
                      </div>
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
