import type { CreateRide } from "@/lib/api/rides";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import type { InferInput } from "valibot";
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
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldHiddenInput,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "@/components/ui/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextField, TextFieldErrorMessage, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { addRide } from "@/lib/api/rides";
import { getVehicleIds, getVehicles } from "@/lib/api/vehicles";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { Vehicles } from "@taxikassede/core/src/entities/vehicles";
import dayjs from "dayjs";
import Loader2 from "lucide-solid/icons/loader-2";
import Plus from "lucide-solid/icons/plus";
import X from "lucide-solid/icons/x";
import { createSignal, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { date, maxValue, minValue, number, pipe, safeParse, string, transform } from "valibot";
import Calendar from "../Calendar";

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
    status: "pending",
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
    <Dialog open={open()} onOpenChange={setOpen}>
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
          <div class="w-full flex flex-col gap-1">
            <span class="text-sm font-bold">Vehicle</span>
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
                  <Select<Vehicles.Info, Vehicles.Info[]>
                    options={vs()}
                    value={vs().find((v) => v.id === newRide.vehicle_id)}
                    onChange={(v) => {
                      if (!v) return;
                      setNewRide("vehicle_id", v.id);
                    }}
                    optionValue={(v) => v.id}
                    optionTextValue={(v) => v.name}
                    placeholder="Select a vehicle"
                    itemComponent={(props) => (
                      <SelectItem item={props.item} class="text-sm font-semibold">
                        {props.item.rawValue.name}{" "}
                        <Show when={props.item.rawValue.model} keyed>
                          {(vM) => (
                            <span class="text-xs text-muted-foreground">
                              ({vM.name}, {vM.brand})
                            </span>
                          )}
                        </Show>
                      </SelectItem>
                    )}
                    disallowEmptySelection
                    required
                    disabled={addRideStatus.pending}
                  >
                    <SelectTrigger>
                      <SelectValue<Vehicles.Info>>
                        {(props) => (
                          <span>
                            {props.selectedOption().name}{" "}
                            <Show when={props.selectedOption().model} keyed>
                              {(vM) => (
                                <span class="text-xs text-muted-foreground">
                                  ({vM.name}, {vM.brand})
                                </span>
                              )}
                            </Show>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                  <NumberField
                    changeOnWheel={false}
                    minValue={0}
                    defaultValue={Number(newRide.distance)}
                    onRawValueChange={(v) => {
                      if (v === null) return;
                      if (v < 0) return setNewRide("distance", "0.000");
                      const as_string = v.toString();
                      setNewRide("distance", as_string);
                    }}
                    formatOptions={{
                      unit: "meter",
                      unitDisplay: "long",
                    }}
                    format
                    step={10}
                  >
                    <NumberFieldLabel class="text-sm font-bold">Distance (meter)</NumberFieldLabel>
                    <NumberFieldHiddenInput />
                    <NumberFieldGroup>
                      <NumberFieldDecrementTrigger aria-label="Decrement" />
                      <NumberFieldInput />
                      <NumberFieldIncrementTrigger aria-label="Increment" />
                    </NumberFieldGroup>
                  </NumberField>
                  <div class="w-full flex flex-col gap-1">
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
                    <span class="text-sm font-bold">End Time</span>
                    <Calendar
                      value={newRide.endedAt}
                      onChange={(v) => {
                        const MinDateSchema = pipe(
                          date("Please provide a date"),
                          minValue(newRide.startedAt!, "The end date must be after the start date"),
                        );
                        const isValid = safeParse(MinDateSchema, v);
                        if (!isValid.success) {
                          setError(isValid.issues[0].message);
                          console.log(isValid.issues[0].message);
                          return;
                        } else {
                          setError(undefined);
                        }
                        setNewRide("endedAt", isValid.output);
                      }}
                      min={newRide.startedAt}
                    />
                    <div class="w-full flex flex-row items-center justify-between gap-2">
                      <TextFieldRoot
                        value={dayjs(newRide.endedAt).format("HH")}
                        onChange={(v) => {
                          const isValid = safeParse(HourNumberSchema, v);
                          if (!isValid.success) {
                            setErrors("endedAtHour", isValid.issues[0].message);
                            return;
                          }
                          setNewRide("endedAt", dayjs(newRide.endedAt).set("hour", Number(v)).toDate());
                        }}
                        class="w-full"
                      >
                        <TextFieldLabel>
                          <span class="text-sm  font-bold">Time (hour)</span>
                          <TextField class="w-full" />
                        </TextFieldLabel>
                        <Show when={errors.endedAtHour.length > 0}>
                          <TextFieldErrorMessage>{errors.endedAtHour}</TextFieldErrorMessage>
                        </Show>
                      </TextFieldRoot>
                      <TextFieldRoot
                        value={dayjs(newRide.endedAt).format("mm")}
                        onChange={(v) => {
                          const isValid = safeParse(MinuteNumberSchema, v);
                          if (!isValid.success) {
                            setErrors("endedAtMinute", isValid.issues[0].message);
                            return;
                          }
                          setNewRide("endedAt", dayjs(newRide.endedAt).set("minute", Number(v)).toDate());
                        }}
                        class="w-full"
                      >
                        <TextFieldLabel>
                          <span class="text-sm  font-bold">Time (minute)</span>
                          <TextField class="w-full" />
                        </TextFieldLabel>
                        <Show when={errors.endedAtMinute.length > 0}>
                          <TextFieldErrorMessage>{errors.endedAtMinute}</TextFieldErrorMessage>
                        </Show>
                      </TextFieldRoot>
                    </div>
                  </div>
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
              setOpen(false);
            }}
            class="flex flex-row items-center gap-2"
          >
            <X class="size-4" />
            Cancel
          </Button>
          <Button
            onClick={() => {
              toast.promise(addRideAction(newRide), {
                loading: "Adding ride",
                success: () => {
                  setOpen(false);
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
