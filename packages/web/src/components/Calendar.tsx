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
import { parseAbsolute, parseDateTime, parseZonedDateTime } from "@internationalized/date";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import { Index } from "solid-js";

dayjs.extend(tz);

const Calendar = (props: { value: Date; onChange: (v: Date) => void; min?: Date; max?: Date }) => {
  const timezone = dayjs.tz.guess();
  return (
    <DatePicker
      selectionMode="single"
      value={[props.value, props.value].map((d) => parseAbsolute(dayjs(d).toISOString(), timezone))}
      onValueChange={(v) => {
        const lcd = dayjs(props.value).format("YYYY-MM-DD");
        // find the index of the last changed date and take the other one
        const index = v.valueAsString.findIndex((d) => d === lcd);
        if (index === -1) {
          console.error("Could not find the last changed date");
          return;
        }
        const theOtherDate = v.value[index === 0 ? 1 : 0].toDate(timezone);

        props.onChange(theOtherDate);
      }}
      min={props.min ? parseAbsolute(dayjs(props.min).toISOString(), timezone) : undefined}
      max={props.max ? parseAbsolute(dayjs(props.max).toISOString(), timezone) : undefined}
    >
      <DatePickerInput placeholder="Pick a date" />
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
                      <Index each={api().weekDays}>
                        {(weekDay) => <DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>}
                      </Index>
                    </DatePickerTableRow>
                  </DatePickerTableHead>
                  <DatePickerTableBody>
                    <Index each={api().weeks}>
                      {(week) => (
                        <DatePickerTableRow>
                          <Index each={week()}>
                            {(day) => (
                              <DatePickerTableCell value={day()}>
                                <DatePickerTableCellTrigger>{day().day}</DatePickerTableCellTrigger>
                              </DatePickerTableCell>
                            )}
                          </Index>
                        </DatePickerTableRow>
                      )}
                    </Index>
                  </DatePickerTableBody>
                </DatePickerTable>
              </>
            )}
          </DatePickerContext>
        </DatePickerView>
        <DatePickerView view="month" class="w-[calc(var(--reference-width)-(0.75rem*2))]">
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
                    <Index
                      each={api().getMonthsGrid({
                        columns: 4,
                        format: "short",
                      })}
                    >
                      {(months) => (
                        <DatePickerTableRow>
                          <Index each={months()}>
                            {(month) => (
                              <DatePickerTableCell value={month().value}>
                                <DatePickerTableCellTrigger>{month().label}</DatePickerTableCellTrigger>
                              </DatePickerTableCell>
                            )}
                          </Index>
                        </DatePickerTableRow>
                      )}
                    </Index>
                  </DatePickerTableBody>
                </DatePickerTable>
              </>
            )}
          </DatePickerContext>
        </DatePickerView>
        <DatePickerView view="year" class="w-[calc(var(--reference-width)-(0.75rem*2))]">
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
                    <Index
                      each={api().getYearsGrid({
                        columns: 4,
                      })}
                    >
                      {(years) => (
                        <DatePickerTableRow>
                          <Index each={years()}>
                            {(year) => (
                              <DatePickerTableCell value={year().value}>
                                <DatePickerTableCellTrigger>{year().label}</DatePickerTableCellTrigger>
                              </DatePickerTableCell>
                            )}
                          </Index>
                        </DatePickerTableRow>
                      )}
                    </Index>
                  </DatePickerTableBody>
                </DatePickerTable>
              </>
            )}
          </DatePickerContext>
        </DatePickerView>
      </DatePickerContent>
    </DatePicker>
  );
};

export default Calendar;
