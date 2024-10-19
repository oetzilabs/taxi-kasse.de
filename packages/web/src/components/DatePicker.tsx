// solidjs
import {
  DatePicker,
  DatePickerContent,
  DatePickerContext,
  DatePickerInput,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
} from "@/components/ui/date-picker";
import { ClassValue } from "clsx";
import dayjs from "dayjs";
import { createSignal, For, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";
import { cn } from "../lib/utils";

// Types for DatePicker Props
interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date) => void;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  minDate?: Date | null;
  placeholderText?: string;
  class?: ClassValue;
}

const isoFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ";
export default function DatePickerComponent(props: DatePickerProps): JSX.Element {
  return (
    <DatePicker
      selectionMode="single"
      class={cn("w-full", props.class)}
      onValueChange={(dates) => {
        props.onChange(dayjs(dates.valueAsString[0]).toDate());
      }}
    >
      <DatePickerInput
        placeholder={props.placeholderText ?? "Select Date"}
        value={props.selected?.toDateString() || ""}
      />
      <Portal>
        <DatePickerContent>
          <DatePickerView view="day">
            <DatePickerContext>
              {(api) => (
                <>
                  <DatePickerViewControl>
                    <DatePickerViewTrigger>
                      <DatePickerRangeText />
                    </DatePickerViewTrigger>
                  </DatePickerViewControl>
                  <DatePickerTable>
                    <DatePickerTableHead>
                      <DatePickerTableRow>
                        <For each={api().weekDays}>
                          {(weekDay) => <DatePickerTableHeader>{weekDay.short}</DatePickerTableHeader>}
                        </For>
                      </DatePickerTableRow>
                    </DatePickerTableHead>
                    <DatePickerTableBody>
                      <For each={api().weeks}>
                        {(week) => (
                          <DatePickerTableRow>
                            <For each={week}>
                              {(day) => (
                                <DatePickerTableCell value={day}>
                                  <DatePickerTableCellTrigger>{day.day}</DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </For>
                          </DatePickerTableRow>
                        )}
                      </For>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </>
              )}
            </DatePickerContext>
          </DatePickerView>
          <DatePickerView view="month">
            <DatePickerContext>
              {(api) => (
                <>
                  <DatePickerViewControl>
                    <DatePickerViewTrigger>
                      <DatePickerRangeText />
                    </DatePickerViewTrigger>
                  </DatePickerViewControl>
                  <DatePickerTable>
                    <DatePickerTableBody>
                      <For
                        each={api().getMonthsGrid({
                          columns: 4,
                          format: "short",
                        })}
                      >
                        {(months) => (
                          <DatePickerTableRow>
                            <For each={months}>
                              {(month) => (
                                <DatePickerTableCell value={month.value}>
                                  <DatePickerTableCellTrigger>{month.label}</DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </For>
                          </DatePickerTableRow>
                        )}
                      </For>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </>
              )}
            </DatePickerContext>
          </DatePickerView>
          <DatePickerView view="year">
            <DatePickerContext>
              {(api) => (
                <>
                  <DatePickerViewControl>
                    <DatePickerViewTrigger>
                      <DatePickerRangeText />
                    </DatePickerViewTrigger>
                  </DatePickerViewControl>
                  <DatePickerTable>
                    <DatePickerTableBody>
                      <For
                        each={api().getYearsGrid({
                          columns: 4,
                        })}
                      >
                        {(years) => (
                          <DatePickerTableRow>
                            <For each={years}>
                              {(year) => (
                                <DatePickerTableCell value={year.value}>
                                  <DatePickerTableCellTrigger>{year.label}</DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </For>
                          </DatePickerTableRow>
                        )}
                      </For>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </>
              )}
            </DatePickerContext>
          </DatePickerView>
        </DatePickerContent>
      </Portal>
    </DatePicker>
  );
}
