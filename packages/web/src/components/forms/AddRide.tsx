import type { CreateRide } from "@/lib/api/rides";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NumberField, NumberFieldInput } from "@/components/ui/number-field";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { addRide } from "@/lib/api/rides";
import { getVehicles } from "@/lib/api/vehicles";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { cn, parseLocaleNumber } from "~/lib/utils";
import dayjs from "dayjs";
import Loader2 from "lucide-solid/icons/loader-2";
import Plus from "lucide-solid/icons/plus";
import X from "lucide-solid/icons/x";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { maxValue, minValue, number, pipe, string, transform } from "valibot";
import { language } from "../stores/Language";
import { Checkbox, CheckboxControl, CheckboxDescription, CheckboxLabel } from "../ui/checkbox";

const MinuteNumberSchema = pipe(
  string("Please provide a number"),
  transform((v) => Number(v)),
  number("Please provide a number"),
  minValue(0, "The time must be greater than 0"),
  maxValue(59, "The time must be less than 59"),
);

const HourNumberSchema = pipe(
  string("Please provide a number"),
  transform((v) => Number(v)),
  number("Please provide a number"),
  minValue(0, "The time must be greater than 0"),
  maxValue(23, "The time must be less than 23"),
);

const AddRideModal = () => {
  const [open, setOpen] = createSignal(false);

  const vehicles = createAsync(() => getVehicles());

  const [newRide, setNewRide] = createStore<CreateRide>({
    distance: "0.000",
    added_by: "user:manual",
    income: "0.00",
    rating: "5.00",
    status: "accepted",
    vehicle_id: "",
    startedAt: dayjs().toDate(),
    endedAt: dayjs().toDate(),
  });

  const [error, setError] = createSignal<string | undefined>();
  const [errors, setErrors] = createStore({
    startedAtHour: "",
    startedAtMinute: "",
    endedAtHour: "",
    endedAtMinute: "",
  });

  const addRideAction = useAction(addRide);
  const addRideStatus = useSubmission(addRide);
  return (
    <Dialog
      open={open()}
      onOpenChange={(state) => {
        if (!state) {
          setNewRide("vehicle_id", "");
          setNewRide("distance", "0.000");
          setNewRide("income", "0.00");
          setNewRide("rating", "5.00");
          setNewRide("status", "accepted");
          setNewRide("startedAt", dayjs().toDate());
          setNewRide("endedAt", dayjs().toDate());
          addRideStatus.clear();
        }
        setOpen(state);
      }}
    >
      <DialogTrigger
        as={(props: DialogTriggerProps) => (
          <Button size="sm" {...props} class="flex flex-row items-center gap-2">
            Add
            <Plus class="size-4" />
          </Button>
        )}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Ride</DialogTitle>
          <DialogDescription>Please enter the details of your ride.</DialogDescription>
        </DialogHeader>
        <div class="flex flex-col gap-4">
          <div class="w-full flex flex-col gap-4">
            <Show when={vehicles()}>
              {(vs) => (
                <Show
                  when={vs().length > 0}
                  fallback={
                    <div class="p-3 border-dashed border border-neutral-300 dark:border-neutral-800 items-center justify-center rounded-md flex flex-col gap-1">
                      <span class="text-sm text-muted-foreground ">No vehicles found</span>
                      <span class="text-sm text-neutral-500">
                        Please{" "}
                        <A class="hover:underline" href="/dashboard/vehicles/new">
                          add a vehicle
                        </A>{" "}
                        first.
                      </span>
                    </div>
                  }
                >
                  <div class="grid gric-cols-1 md:grid-cols-2 border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip shadow-sm">
                    <For each={vs()}>
                      {(vehicle) => (
                        <div
                          class={cn(
                            "flex items-center gap-2 flex-col w-full border-b md:border-b-0 md:border-r border-neutral-300 dark:border-neutral-800 last:border-0 p-6 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer",
                            {
                              "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100":
                                vehicle.id === newRide.vehicle_id,
                            },
                          )}
                          onClick={() => {
                            setNewRide("vehicle_id", vehicle.id);
                          }}
                        >
                          <div class="flex flex-row items-center gap-2 text-sm font-bold w-full">
                            <span>{vehicle.name}</span>
                            <Show when={vehicle.model} keyed>
                              {(model) => (
                                <span>
                                  ({model.name} - {model.brand})
                                </span>
                              )}
                            </Show>
                          </div>
                          <div
                            class={cn("text-xs text-neutral-500 w-full font-medium", {
                              "text-blue-500": vehicle.id === newRide.vehicle_id,
                            })}
                          >
                            <Show when={vehicle.id === newRide.vehicle_id} fallback={"Click to Select"}>
                              Selected
                            </Show>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                  <div class="w-full flex flex-col gap-2 p-4 border border-neutral-300 dark:border-neutral-800 rounded-md">
                    <div class="w-full flex flex-col gap-2 items-end">
                      <Checkbox
                        class="flex items-start space-x-2 w-full"
                        disabled={addRideStatus.pending || newRide.vehicle_id === ""}
                      >
                        <div class="grid gap-1.5 leading-none w-full">
                          <CheckboxLabel class="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-20">
                            Save for next ride
                          </CheckboxLabel>
                          <CheckboxDescription class="text-xs text-muted-foreground">
                            This vehicle will be used for the next ride
                          </CheckboxDescription>
                        </div>
                        <CheckboxControl />
                      </Checkbox>
                    </div>
                  </div>
                  <div class="w-full flex flex-col gap-2">
                    <div class="flex flex-row items-center gap-2 justify-between  w-full">
                      <span class="text-sm font-bold">Distance (km)</span>
                      <span class="text-sm font-bold">Income</span>
                    </div>
                    <div class="flex flex-row w-full border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip shadow-sm">
                      <NumberField
                        class="w-full border-0 "
                        value={newRide.distance}
                        minValue={0}
                        onChange={(v) => {
                          if (v === null) return;
                          if (v === "") v = "0";
                          if (Number(v) < 0) v = "0";
                          setNewRide("distance", v);
                        }}
                      >
                        <NumberFieldInput class="max-w-full w-full border-0 focus-visible:ring-0 shadow-none text-left px-3" />
                      </NumberField>
                      <div class="h-full bg-neutral-300 dark:bg-neutral-800 w-px" />
                      <NumberField
                        class="w-max border-0 "
                        value={newRide.income}
                        minValue={0}
                        onChange={(v) => {
                          if (v === null) return;
                          if (v === "") v = "0";
                          if (Number(v) < 0) v = "0";
                          setNewRide("income", v);
                        }}
                      >
                        <NumberFieldInput class="w-full border-0 focus-visible:ring-0 shadow-none text-right px-3" />
                      </NumberField>
                    </div>
                  </div>
                  {/* <div class="w-full flex flex-col gap-1">
                    <span class="text-sm font-bold">Start Time</span>
                    <Calendar
                      value={newRide.startedAt}
                      onChange={(v) => {
                        setNewRide("startedAt", v);
                        const MinDateSchema = pipe(
                          date("Please provide a date"),
                          minValue(newRide.startedAt!, "The end date must be after the start date"),
                        );
                        const isValid = safeParse(MinDateSchema, newRide.endedAt);
                        if (!isValid.success) {
                          setError(isValid.issues[0].message);
                          console.log(isValid.issues[0].message);
                          return;
                        } else {
                          setError(undefined);
                        }
                      }}
                    />
                    <div class="w-full flex flex-row items-center justify-between gap-2">
                      <TextFieldRoot
                        value={dayjs(newRide.startedAt).format("HH")}
                        onChange={(v) => {
                          const isValid = safeParse(HourNumberSchema, v);
                          if (!isValid.success) {
                            setErrors("startedAtHour", isValid.issues[0].message);
                            return;
                          }
                          setNewRide("startedAt", dayjs(newRide.startedAt).set("hour", Number(v)).toDate());
                        }}
                        class="w-full"
                      >
                        <TextFieldLabel>
                          <span class="text-sm  font-bold">Time (hour)</span>
                          <TextField class="w-full" />
                        </TextFieldLabel>
                        <Show when={errors.startedAtHour.length > 0}>
                          <TextFieldErrorMessage>{errors.startedAtHour}</TextFieldErrorMessage>
                        </Show>
                      </TextFieldRoot>
                      <TextFieldRoot
                        value={dayjs(newRide.startedAt).format("mm")}
                        onChange={(v) => {
                          setNewRide("startedAt", dayjs(newRide.startedAt).set("minute", Number(v)).toDate());
                        }}
                        class="w-full"
                      >
                        <TextFieldLabel>
                          <span class="text-sm  font-bold">Time (minute)</span>
                          <TextField class="w-full" />
                        </TextFieldLabel>
                        <Show when={errors.startedAtMinute.length > 0}>
                          <TextFieldErrorMessage>{errors.startedAtMinute}</TextFieldErrorMessage>
                        </Show>
                      </TextFieldRoot>
                    </div>
                  </div>
                  <div class="w-full flex flex-col gap-1">
                    <span class="text-sm font-bold">Duration</span>
                    <div class="w-full flex flex-row items-center justify-between gap-2">
                      <NumberField
                        changeOnWheel={false}
                        minValue={0}
                        maxValue={23}
                        value={Number(dayjs(newRide.endedAt).format("HH"))}
                        onChange={(v) => {
                          if (v === null) return;
                          if (Number(v) < 0) v = "0";
                          setNewRide("endedAt", dayjs(newRide.startedAt).add(Number(v), "hours").toDate());
                        }}
                      >
                        <NumberFieldLabel class="text-sm font-bold">Hour</NumberFieldLabel>
                        <NumberFieldHiddenInput />
                        <NumberFieldGroup>
                          <NumberFieldDecrementTrigger aria-label="Decrement" />
                          <NumberFieldInput />
                          <NumberFieldIncrementTrigger aria-label="Increment" />
                        </NumberFieldGroup>
                      </NumberField>
                      <NumberField
                        changeOnWheel={false}
                        minValue={0}
                        maxValue={59}
                        value={Number(dayjs(newRide.endedAt).format("mm"))}
                        onChange={(v) => {
                          if (v === null) return;
                          if (Number(v) < 0) v = "0";
                          setNewRide("endedAt", dayjs(newRide.startedAt).add(Number(v), "minutes").toDate());
                        }}
                      >
                        <NumberFieldLabel class="text-sm font-bold text-right">Minutes</NumberFieldLabel>
                        <NumberFieldHiddenInput />
                        <NumberFieldGroup>
                          <NumberFieldDecrementTrigger aria-label="Decrement" />
                          <NumberFieldInput />
                          <NumberFieldIncrementTrigger aria-label="Increment" />
                        </NumberFieldGroup>
                      </NumberField>
                    </div>
                  </div> */}
                  <Show when={error()}>{(e) => <div class="text-sm text-red-500">{e()}</div>}</Show>
                  <div class=""></div>
                </Show>
              )}
            </Show>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setNewRide("vehicle_id", "");
              setNewRide("distance", "0.000");
              setNewRide("income", "0.00");
              setNewRide("rating", "5.00");
              setNewRide("status", "accepted");
              setNewRide("startedAt", dayjs().toDate());
              setNewRide("endedAt", dayjs().toDate());
              addRideStatus.clear();
              setOpen(false);
            }}
            class="flex flex-row items-center gap-2"
          >
            <X class="size-4" />
            Cancel
          </Button>
          <Button
            onClick={() => {
              const r = Object.assign({}, newRide);

              let lang = "";
              if (typeof language === "string") {
                lang = language;
              } else {
                lang = language();
              }
              r.income = String(parseLocaleNumber(lang, r.income));
              r.distance = String(parseLocaleNumber(lang, r.distance) * 1000);
              r.rating = String(parseLocaleNumber(lang, r.rating));

              if (!r.vehicle_id || r.vehicle_id === "") {
                toast.error("Please select a vehicle");
                return;
              }
              if (!r.startedAt) {
                toast.error("Please select a start date");
                return;
              }
              if (!r.endedAt) {
                toast.error("Please select an end date");
                return;
              }
              if (r.startedAt > r.endedAt) {
                toast.error("The end date must be after the start date");
                return;
              }
              if (r.distance === "0.000") {
                toast.error("Please enter a distance");
                return;
              }
              if (r.income === "0.00") {
                toast.error("Please enter an income");
                return;
              }
              toast.promise(addRideAction(r), {
                loading: "Adding ride",
                success: () => {
                  setOpen(false);
                  addRideStatus.clear();
                  return "Ride added";
                },
                error: "Failed to add ride",
              });
            }}
            class="flex flex-row items-center gap-2"
          >
            <Switch>
              <Match when={addRideStatus.pending}>
                <Loader2 class="size-4 animate-spin" />
                Adding Ride
              </Match>
              <Match when={!addRideStatus.pending && addRideStatus.result === undefined}>Add Ride</Match>
              <Match when={!addRideStatus.pending && addRideStatus.result !== undefined}>Added Ride</Match>
              <Match when={addRideStatus.error}>Failed to add ride</Match>
            </Switch>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRideModal;
