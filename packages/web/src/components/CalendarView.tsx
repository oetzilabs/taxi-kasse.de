import type { Calendar } from "@taxikassede/core/src/entities/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDailyRecord, updateDailyRecord, upsertDailyRecord } from "@/lib/api/calendar";
import { createForm, getValues, setValue } from "@modular-forms/solid";
import { useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import germanLanguage from "dayjs/locale/de";
import englishLanguage from "dayjs/locale/en";
import isBetween from "dayjs/plugin/isBetween";
import Pencil from "lucide-solid/icons/pencil";
import Plus from "lucide-solid/icons/plus";
import Trash from "lucide-solid/icons/trash";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { toast } from "solid-sonner";
import { cn } from "../lib/utils";
import { language } from "./stores/Language";
import { NumberField, NumberFieldErrorMessage, NumberFieldInput, NumberFieldLabel } from "./ui/number-field";

dayjs.extend(isBetween);

type DayData = {
  id: string;
  date: Date;
  total_distance: string;
  occupied_distance: string;
  revenue: string;
  tour: number;
};

type CalendarViewProps = {
  records: DayData[];
  month?: Date;
};

export const CalendarView = (props: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = createSignal(props.month || new Date());

  createEffect(() => {
    const lang = language();
    switch (lang) {
      case "de":
        dayjs.locale(germanLanguage);
        break;
      case "en":
        dayjs.locale(englishLanguage);
        break;
      default:
        dayjs.locale(englishLanguage);
        break;
    }
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: dayjs().month(i).format("MMMM"),
  }));

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = dayjs().year() - 5 + i;
    return { value: year, label: year.toString() };
  });

  const daysInMonth = createMemo(() => {
    const start = dayjs(currentMonth()).startOf("month");
    const daysArray = [];
    const monthStart = start.startOf("month");
    const monthEnd = start.endOf("month");

    const startPadding = monthStart.day();

    for (let i = 0; i < monthEnd.date(); i++) {
      const currentDate = monthStart.add(i, "day").toDate();
      const dayData = props.records.find(
        (record) => dayjs(record.date).format("YYYY-MM-DD") === dayjs(currentDate).format("YYYY-MM-DD"),
      );

      daysArray.push({
        date: currentDate,
        isCurrentMonth: true,
        data: dayData || null,
      });
    }

    return daysArray;
  });

  const updateDate = (monthOrYear: "month" | "year", value: number) => {
    setCurrentMonth((prev) => {
      const date = dayjs(prev);
      return monthOrYear === "month" ? date.month(value).toDate() : date.year(value).toDate();
    });
  };

  const [createRecordForm, { Form, Field }] = createForm<Calendar.Creator>();

  const upsert_daily_record_action = useAction(upsertDailyRecord);
  const upsert_daily_record_submission = useSubmission(upsertDailyRecord);

  const updateDailyRecordAction = useAction(updateDailyRecord);
  const updateDailyRecordSubmission = useSubmission(updateDailyRecord);

  const delete_daily_record_action = useAction(deleteDailyRecord);
  const delete_daily_record_submission = useSubmission(deleteDailyRecord);

  return (
    <div class="w-full flex flex-col gap-4 pb-20">
      <div class="flex items-center justify-end gap-0 ">
        <DropdownMenu sameWidth>
          <DropdownMenuTrigger as={Button} variant="outline" size="sm" class="rounded-r-none border-r-0">
            {dayjs(currentMonth()).format("MMM")}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {months.map((month) => (
              <DropdownMenuItem onSelect={() => updateDate("month", month.value)} class="justify-start">
                {month.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu sameWidth>
          <DropdownMenuTrigger as={Button} size="sm" class="rounded-l-none">
            {dayjs(currentMonth()).format("YYYY")}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {years.map((year) => (
              <DropdownMenuItem onSelect={() => updateDate("year", year.value)} class="justify-end">
                {year.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="relative overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-md">
        <table class="w-full text-sm">
          <thead class="text-left bg-white dark:bg-neutral-950">
            <tr class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              <th class="p-2 font-bold pl-4">Date</th>
              <th class="p-2 font-bold">
                <span class="sr-only md:not-sr-only">Total Distance</span>
                <span class="md:sr-only not-sr-only">TD</span>
              </th>
              <th class="p-2 font-bold">
                <span class="sr-only md:not-sr-only">Occupied Distance</span>
                <span class="md:sr-only not-sr-only">OD</span>
              </th>
              <th class="p-2 font-bold">Tours</th>
              <th class="p-2 font-bold">
                <span class="sr-only md:not-sr-only">Revenue</span>
                <span class="md:sr-only not-sr-only">$</span>
              </th>
              <th class="p-2 font-bold text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-neutral-950">
            <For each={daysInMonth()}>
              {(day) => (
                <tr
                  class={cn("border-b border-neutral-200 dark:border-neutral-800 last:border-0", {
                    "text-neutral-400": !day.isCurrentMonth,
                  })}
                >
                  <td class="p-2 font-mono pl-4">{dayjs(day.date).format("dd DD")}</td>
                  <td class="p-2">{day.data?.total_distance || "-"}</td>
                  <td class="p-2">{day.data?.occupied_distance || "-"}</td>
                  <td class="p-2">{day.data?.tour || "-"}</td>
                  <td class="p-2">{day.data?.revenue || "-"}</td>
                  <td class="p-2 gap-2 text-right pr-4">
                    <div class="flex flex-row gap-2 items-center justify-end">
                      <Show
                        when={day.data}
                        fallback={
                          <AlertDialog>
                            <AlertDialogTrigger as={Button} variant="outline" size="sm" class="h-6 gap-2">
                              <Plus class="size-3" />
                              <span>Add</span>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Add Daily Record for {dayjs(day.date).format("Do MMMM YYYY")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Add a daily record for the current month.
                                </AlertDialogDescription>
                                <Form class="flex flex-col gap-2 w-full">
                                  <Field name="total_distance" type="string">
                                    {(field, props) => (
                                      <>
                                        <NumberField
                                          onChange={(v) => {
                                            setValue(createRecordForm, field.name, v);
                                          }}
                                          class="w-full"
                                        >
                                          <NumberFieldLabel class="capitalize">
                                            {field.name.split("_").join(" ")}
                                          </NumberFieldLabel>
                                          <NumberFieldInput placeholder="Total Distance" class="text-left px-2" />
                                          <NumberFieldErrorMessage>{field.error}</NumberFieldErrorMessage>
                                        </NumberField>
                                      </>
                                    )}
                                  </Field>
                                  <Field name="occupied_distance" type="string">
                                    {(field, props) => (
                                      <>
                                        <NumberField
                                          onChange={(v) => {
                                            setValue(createRecordForm, field.name, v);
                                          }}
                                          class="w-full"
                                        >
                                          <NumberFieldLabel class="capitalize">
                                            {field.name.split("_").join(" ")}
                                          </NumberFieldLabel>
                                          <NumberFieldInput placeholder="Occupied Distance" class="text-left px-2" />
                                          <NumberFieldErrorMessage>{field.error}</NumberFieldErrorMessage>
                                        </NumberField>
                                      </>
                                    )}
                                  </Field>
                                  <Field name="tour" type="number">
                                    {(field, props) => (
                                      <>
                                        <NumberField
                                          onChange={(v) => {
                                            setValue(createRecordForm, field.name, +v);
                                          }}
                                          class="w-full"
                                        >
                                          <NumberFieldLabel class="capitalize">
                                            {field.name.split("_").join(" ")}
                                          </NumberFieldLabel>
                                          <NumberFieldInput placeholder="Tour" class="text-left px-2" />
                                          <NumberFieldErrorMessage>{field.error}</NumberFieldErrorMessage>
                                        </NumberField>
                                      </>
                                    )}
                                  </Field>
                                  <Field name="revenue" type="string">
                                    {(field, props) => (
                                      <>
                                        <NumberField
                                          onChange={(v) => {
                                            setValue(createRecordForm, field.name, v);
                                          }}
                                          class="w-full"
                                        >
                                          <NumberFieldLabel class="capitalize">
                                            {field.name.split("_").join(" ")}
                                          </NumberFieldLabel>
                                          <NumberFieldInput placeholder="Revenue" class="text-left px-2" />
                                          <NumberFieldErrorMessage>{field.error}</NumberFieldErrorMessage>
                                        </NumberField>
                                      </>
                                    )}
                                  </Field>
                                </Form>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogClose size="sm">
                                  <span>Cancel</span>
                                </AlertDialogClose>
                                <AlertDialogAction
                                  disabled={upsert_daily_record_submission.pending}
                                  class="gap-2"
                                  size="sm"
                                  onClick={() => {
                                    let data = getValues(createRecordForm);
                                    console.log(data);
                                    const default_data = {
                                      total_distance: "0",
                                      occupied_distance: "0",
                                      tour: 0,
                                      revenue: "0",
                                    };
                                    const final_data = {
                                      date: dayjs(day.date).add(1, "day").toDate(),
                                      total_distance: data.total_distance ?? default_data.total_distance,
                                      occupied_distance: data.occupied_distance ?? default_data.occupied_distance,
                                      tour: data.tour ?? default_data.tour,
                                      revenue: data.revenue ?? default_data.revenue,
                                    };
                                    console.log(final_data);
                                    toast.promise(upsert_daily_record_action(final_data), {
                                      loading: "Adding...",
                                      success: "Added",
                                      error: "Failed to add",
                                    });
                                  }}
                                >
                                  <Plus class="size-3" />
                                  <span>Add</span>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        }
                      >
                        {(d) => (
                          <>
                            <Button variant="outline" size="sm" class="h-6 gap-2">
                              <Pencil class="size-3" />
                              <span>Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger as={Button} variant="destructive" size="icon" class="size-6 gap-2">
                                <Trash class="size-3" />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Daily Record</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this daily record?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogClose size="sm">
                                    <span>No, Cancel!</span>
                                  </AlertDialogClose>
                                  <AlertDialogAction
                                    class="gap-2"
                                    size="sm"
                                    variant="destructive"
                                    disabled={delete_daily_record_submission.pending}
                                    onClick={() => {
                                      toast.promise(delete_daily_record_action(d().id), {
                                        loading: "Deleting...",
                                        success: "Deleted",
                                        error: "Failed to delete",
                                      });
                                    }}
                                  >
                                    <Trash class="size-3" />
                                    <span>Yes, Delete!</span>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </Show>
                    </div>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
};
