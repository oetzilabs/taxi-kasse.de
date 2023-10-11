import { DayEntrySelect } from "@taxi-kassede/core/drizzle/sql/schema";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { cn } from "../utils/cn";
dayjs.extend(advancedFormat);

type DayEntryProps = {
  entry: DayEntrySelect;
  calendarDays: number;
  index: number;
  range: { from: Date; to: Date };
  locale: string;
};

export const DayEntry = (props: DayEntryProps) => {
  console.log("date", props.entry.date, "samemonth", dayjs(props.entry.date).isSame(props.range.from, "month"));
  return (
    <div
      class={cn(
        "flex flex-col gap-2 w-full p-4 border-b border-r border-neutral-200 dark:border-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-900 cursor-pointer text-sm min-h-[100px]",
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
      <div class="flex w-full h-full justify-between">
        <div class="w-max h-full flex flex-row gap-2 ">
          <div class="font-medium ">{dayjs(props.entry.date).format("ddd Do")}</div>
          <div class="flex flex-row gap-2"></div>
        </div>
        <div class="font-bold w-max">{new Intl.NumberFormat(props.locale).format(props.entry.cash)} CHF</div>
      </div>
    </div>
  );
};
