import type { CreateVehicle } from "@/lib/api/vehicles";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
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
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "@/components/ui/number-field";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { addVehicle, getVehicleIds, getVehicleModels, getVehicles } from "@/lib/api/vehicles";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, revalidate, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import { Index, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import { toast } from "solid-sonner";
import { language } from "~/components/stores/Language";
import { parseLocaleNumber } from "~/lib/utils";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const models = await getVehicleModels();
    return { session, models };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession());
  const vehicleModels = createAsync(() => getVehicleModels(), { deferStream: true });
  const [newVehicle, setNewVehicle] = createStore<CreateVehicle>({
    name: "",
    license_plate: "",
    model_id: null,
    inspection_date: new Date(),
    mileage: "0.000",
  });

  const addVehicleAction = useAction(addVehicle);
  const addVehicleStatus = useSubmission(addVehicle);

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session() && session()!.user !== null && session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-8 max-w-2xl">
            <div class="flex flex-col w-full gap-2">
              <h2 class="text-lg font-bold">Add a new Vehicle</h2>
              <span class="text-sm text-muted-foreground">Add a new vehicle to your list of vehicles</span>
            </div>
            <div class="space-y-4">
              <div class="w-full">
                <TextFieldRoot value={newVehicle.name} onChange={(value) => setNewVehicle("name", value)}>
                  <TextFieldLabel>
                    <span class="text-sm font-bold">How do you want to call this Vehicle?</span>
                  </TextFieldLabel>
                  <TextField placeholder="Enter the name of the Vehicle" autofocus />
                </TextFieldRoot>
              </div>
              <div class="w-full">
                <TextFieldRoot
                  value={newVehicle.license_plate}
                  onChange={(value) => setNewVehicle("license_plate", value)}
                >
                  <TextFieldLabel>
                    <span class="text-sm font-bold">Vehicle License Plate</span>
                  </TextFieldLabel>
                  <TextField placeholder="Enter the License Plate of the Vehicle" class="max-w-full min-w-[300px]" />
                </TextFieldRoot>
              </div>
              <div class="w-full flex flex-col gap-1">
                <div class="flex flex-row items-center justify-between gap-2">
                  <span class="text-sm font-bold">Model </span>
                  <span class="text-xs text-muted-foreground">(list last updated: 22nd Jan 2021)</span>
                </div>
                <Show
                  when={vehicleModels() && vehicleModels()!.length > 0 && vehicleModels()}
                  fallback={
                    <div class="text-sm text-muted-foreground p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg min-w-[200px] items-center justify-center flex select-none">
                      No models available at this moment
                    </div>
                  }
                  keyed
                >
                  {(brands) => (
                    <Combobox<(typeof brands)[number]["models"][number], (typeof brands)[number]>
                      options={brands}
                      onChange={(e) => {
                        if (!e) return;
                        setNewVehicle("model_id", e.value);
                      }}
                      sameWidth
                      value={brands
                        .map((b) => b.models)
                        .flat()
                        .find((m) => m.value === newVehicle.model_id)}
                      optionValue={(b) => b.value}
                      optionLabel={(b) => b.label}
                      optionTextValue={(b) => b.label}
                      optionGroupChildren="models"
                      // virtualized
                      placeholder="Choose a Model"
                      selectionBehavior="replace"
                      modal
                      itemComponent={(props) => (
                        <ComboboxItem item={props.item}>
                          <span class="text-sm font-semibold">{props.item.rawValue.label}</span>
                        </ComboboxItem>
                      )}
                      sectionComponent={(props) => (
                        <div class="text-xs font-bold text-muted-foreground">{props.section.rawValue.group}</div>
                      )}
                    >
                      <ComboboxTrigger>
                        <ComboboxInput />
                      </ComboboxTrigger>
                      <ComboboxContent class="max-h-40 overflow-y-auto" />
                    </Combobox>
                  )}
                </Show>
              </div>
              <div class="w-full">
                <span class="text-sm font-bold">When was the last Inspection Date? (MFK Date)</span>
                <DatePicker
                  startOfWeek={1}
                  selectionMode="single"
                  modal
                  onValueChange={(value) => {
                    const d1 = dayjs(value.valueAsString[0]).toDate();
                    const d2 = dayjs(value.valueAsString[1]).toDate();
                    const oldD = dayjs(newVehicle.inspection_date).toDate();
                    if (d1 !== oldD) {
                      setNewVehicle("inspection_date", d1);
                      return;
                    }
                    if (d2 !== oldD) {
                      setNewVehicle("inspection_date", d2);
                      return;
                    }
                  }}
                >
                  <DatePickerInput placeholder="Pick MFK Date" />
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
                  </Portal>
                </DatePicker>
              </div>
              <div class="w-full">
                <NumberField
                  value={newVehicle.mileage}
                  onChange={(value) => {
                    const pN = parseLocaleNumber(language(), value);
                    setNewVehicle("mileage", String(pN))
                  }}
                  minValue={0}
                >
                  <NumberFieldLabel>
                    <span class="text-sm font-bold">Mileage (km)</span>
                  </NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldDecrementTrigger aria-label="Decrement" />
                    <NumberFieldInput class="" placeholder="Enter the Mileage of the Vehicle" />
                    <NumberFieldIncrementTrigger aria-label="Increment" />
                  </NumberFieldGroup>
                </NumberField>
              </div>
              <Button
                class="w-max"
                onClick={async () => {
                  if (!newVehicle.name || !newVehicle.license_plate || !newVehicle.model_id || !newVehicle.inspection_date || !newVehicle.mileage) {
                    toast.error("Please fill out all fields.");
                    return;
                  }
                  toast.promise(addVehicleAction(newVehicle), {
                    loading: "Adding vehicle...",
                    success: "Vehicle added",
                    error: (e) => "Could not add vehicle: " + e.message,
                  });
                  await revalidate([getVehicles.key, getVehicleIds.key]);
                }}
                disabled={addVehicleStatus.pending}
              >
                Create Vehicle
              </Button>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
