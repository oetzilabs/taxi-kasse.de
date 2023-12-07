import { DayEntrySelect } from "@taxi-kassede/core/drizzle/sql/schema";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { cn } from "../utils/cn";
import { Match, Show, Switch } from "solid-js";
dayjs.extend(advancedFormat);

type DayEntryProps = {
  entry: DayEntrySelect;
  calendarDays: number;
  index: number;
  range: { from: Date; to: Date };
  locale: string;
};

export const DayEntry = (props: DayEntryProps) => {
  return (
    <div
      class={cn(
        "flex flex-row gap-2 w-full p-4 border-b border-r border-neutral-200 dark:border-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-900 cursor-pointer text-sm min-h-[100px] justify-center items-center",
        { "!opacity-20": !dayjs(props.entry.date).isSame(props.range.from, "month") },
        { "opacity-70": props.entry.cash === 0 },
        { "text-blue-500": !!props.entry.id },
        {
          "!border-b-0": props.index >= props.calendarDays - 7,
        },
        {
          "!border-r-0": dayjs(props.entry.date).day() === 6,
        }
      )}
    >
      <div class="flex flex-row w-full h-full justify-center items-center">
        <Switch
          fallback={
            <div class="flex flex-col gap-2 items-center justify-center">
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
              <span>{dayjs(props.entry.date).format("ddd Do")}</span>
              <span class="sr-only">Add entry</span>
            </div>
          }
        >
          <Match when={props.entry.id}>
            <div class="flex flex-col gap-2 items-center justify-center">
              <div class="font-bold">{new Intl.NumberFormat(props.locale).format(props.entry.cash)} CHF</div>
              <div class="flex flex-row gap-2 ">
                <span class="font-medium ">{dayjs(props.entry.date).format("ddd Do")}</span>
              </div>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
};
