import type { CreateRide } from "@/lib/api/rides";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import type { CurrencyCode } from "../../lib/api/application";
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
import { NumberField, NumberFieldInput, NumberFieldLabel } from "@/components/ui/number-field";
import { SwitchControl, Switch as Switcher, SwitchLabel, SwitchThumb } from "@/components/ui/switch";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { addRide, calculateDistanceAndCharge } from "@/lib/api/rides";
import { getVehicles } from "@/lib/api/vehicles";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { cn, parseLocaleNumber } from "~/lib/utils";
import dayjs from "dayjs";
import Loader2 from "lucide-solid/icons/loader-2";
import Map from "lucide-solid/icons/map";
import Plus from "lucide-solid/icons/plus";
import X from "lucide-solid/icons/x";
import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { maxValue, minValue, number, pipe, string, transform } from "valibot";
import { language } from "../stores/Language";
import { Badge } from "../ui/badge";
import { Checkbox, CheckboxControl, CheckboxDescription, CheckboxLabel } from "../ui/checkbox";

const ClientRouteMap = clientOnly(() => import("../ClientRouteMap"));

const AddRideModal = (props: {
  company_id: string;
  vehicle_id_used_last_time: string | null;
  vehicle_id_saved: string | null;
  base_charge: number;
  distance_charge: number;
  time_charge: number;
  currency_code: CurrencyCode;
}) => {
  const [open, setOpen] = createSignal(false);

  const vehicles = createAsync(() => getVehicles());

  const [newRide, setNewRide] = createStore<CreateRide>({
    comp_id: props.company_id,
    departure: "",
    arrival: "",
    distance: "0.000",
    added_by: "user:manual",
    income: "0.00",
    rating: "5.00",
    status: "accepted",
    vehicle_id: props.vehicle_id_saved ?? "",
    startedAt: dayjs().toDate(),
    endedAt: dayjs().toDate(),
  });

  const [checkSavedVehicleId, setCheckSavedVehicleId] = createSignal(props.vehicle_id_saved ?? "");

  const [error, setError] = createSignal<string | undefined>();
  const [errors, setErrors] = createStore({
    startedAtHour: "",
    startedAtMinute: "",
    endedAtHour: "",
    endedAtMinute: "",
  });

  const [duration, setDuration] = createSignal(0);

  const addRideAction = useAction(addRide);
  const addRideStatus = useSubmission(addRide);

  const [currency, setCurrency] = createSignal(props.currency_code);

  const [isManualCalculation, setIsManualCalculation] = createSignal(false);

  const automatedCalculation = createMemo(() => {
    const track = parseLocaleNumber(language(), newRide.distance) * props.distance_charge;
    const timed = props.time_charge * duration();
    const result = props.base_charge + track + timed;

    return Math.round(result * 100) / 100;
  });

  const calculateDistanceAndChargeAction = useAction(calculateDistanceAndCharge);
  const calculateDistanceAndChargeSubmission = useSubmission(calculateDistanceAndCharge);

  const [fromCoords, setFromCoords] = createSignal<[number, number] | undefined>(undefined);
  const [toCoords, setToCoords] = createSignal<[number, number] | undefined>(undefined);
  const [routeGeometry, setRouteGeometry] = createSignal<string | undefined>(undefined);

  const resetForm = () => {
    setNewRide("vehicle_id", "");
    setNewRide("distance", "0.000");
    setNewRide("income", "0.00");
    setNewRide("rating", "5.00");
    setNewRide("status", "accepted");
    setNewRide("startedAt", dayjs().toDate());
    setNewRide("endedAt", dayjs().toDate());
    setNewRide("arrival", "");
    setNewRide("departure", "");
    setFromCoords(undefined);
    setToCoords(undefined);
    setRouteGeometry(undefined);
    setCheckSavedVehicleId("");
    addRideStatus.clear();
    calculateDistanceAndChargeSubmission.clear();
    setOpen(false);
    setError("");
    setErrors({
      startedAtHour: "",
      startedAtMinute: "",
      endedAtHour: "",
      endedAtMinute: "",
    });
  };

  return (
    <Dialog
      open={open()}
      onOpenChange={(state) => {
        if (!state) {
          resetForm();
        }
        setOpen(state);
      }}
    >
      <DialogTrigger
        as={(props: DialogTriggerProps) => (
          <Button size="sm" {...props} class="flex flex-row items-center gap-2 h-8 w-max flex-1 p-2 md:px-3 md:py-2">
            <span class="sr-only md:not-sr-only w-max">Add Ride</span>
            <Plus class="size-4" />
          </Button>
        )}
      />
      <DialogContent class="max-w-max">
        <DialogHeader>
          <DialogTitle>New Ride</DialogTitle>
          <DialogDescription>Please enter the details of your ride.</DialogDescription>
        </DialogHeader>
        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-4 min-w-[400px] ">
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
                    <div class="grid gric-cols-1 md:grid-cols-2 gap-2 ">
                      <Show
                        when={vs().length === 1 && vs()[0]}
                        keyed
                        fallback={
                          <For each={vs()}>
                            {(vehicle) => {
                              if (vehicle.preferred !== null && vehicle.preferred) {
                                setCheckSavedVehicleId(vehicle.id);
                                setNewRide("vehicle_id", vehicle.id);
                              }
                              return (
                                <div
                                  class={cn(
                                    "flex items-start gap-2 flex-col w-full border border-neutral-300 dark:border-neutral-800 p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer h-full rounded-lg select-none",
                                    {
                                      "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100":
                                        vehicle.id === newRide.vehicle_id,
                                    },
                                  )}
                                  onClick={() => {
                                    if (vehicle.id === newRide.vehicle_id) {
                                      setNewRide("vehicle_id", "");
                                      return;
                                    } else {
                                      setNewRide("vehicle_id", vehicle.id);
                                      if (checkSavedVehicleId() !== vehicle.id) {
                                        setCheckSavedVehicleId("");
                                      }
                                      if (vehicle.preferred !== null && vehicle.preferred) {
                                        setCheckSavedVehicleId(vehicle.id);
                                      }
                                    }
                                  }}
                                >
                                  <Show
                                    when={vehicle.preferred !== null && vehicle.preferred}
                                    fallback={<div class={cn("text-xs rounded-md px-2 py-0.5")}>&nbsp;</div>}
                                  >
                                    <div class="text-[10px] text-muted-foreground border border-blue-500 rounded-md px-2 py-0.5 bg-blue-500 text-white">
                                      Preferred
                                    </div>
                                  </Show>
                                  <div class="flex flex-row items-baseline gap-2 text-sm font-bold w-full">
                                    <span class="w-max">{vehicle.name}</span>
                                    <Show when={vehicle.model} keyed>
                                      {(model) => (
                                        <span class="text-xs text-neutral-500 w-max font-medium">
                                          ({model.name} - {model.brand})
                                        </span>
                                      )}
                                    </Show>
                                  </div>
                                </div>
                              );
                            }}
                          </For>
                        }
                      >
                        {(vehicle) => {
                          if (vehicle.preferred !== null && vehicle.preferred) {
                            setCheckSavedVehicleId(vehicle.id);
                            setNewRide("vehicle_id", vehicle.id);
                          }
                          return (
                            <div
                              class={cn(
                                "col-span-full flex items-center gap-2 flex-col w-full border border-neutral-300 dark:border-neutral-800 p-6 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-lg",
                                {
                                  "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100":
                                    vehicle.id === newRide.vehicle_id,
                                },
                              )}
                              onClick={() => {
                                if (vehicle.id === newRide.vehicle_id) {
                                  setNewRide("vehicle_id", "");
                                  setCheckSavedVehicleId("");
                                  return;
                                } else {
                                  setNewRide("vehicle_id", vehicle.id);
                                }
                              }}
                            >
                              <Show
                                when={vehicle.preferred !== null && vehicle.preferred}
                                fallback={<div class={cn("text-xs rounded-md px-2 py-0.5")}>&nbsp;</div>}
                              >
                                <div class="text-[10px] text-muted-foreground border border-blue-500 rounded-md px-2 py-0.5 bg-blue-500 text-white">
                                  Preferred
                                </div>
                              </Show>
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
                          );
                        }}
                      </Show>
                    </div>
                    <div
                      class={cn(
                        "w-full flex flex-col gap-2 p-4 border border-neutral-300 dark:border-neutral-800 rounded-md bg-neutral-100 dark:bg-neutral-900 opacity-50",
                        {
                          "opacity-100": newRide.vehicle_id !== "",
                        },
                      )}
                    >
                      <div class="w-full flex flex-col gap-2 items-end">
                        <Checkbox
                          class="flex items-start space-x-2 w-full"
                          disabled={addRideStatus.pending || newRide.vehicle_id === ""}
                          checked={checkSavedVehicleId().length > 0}
                          onChange={(v) => {
                            if (v) {
                              setCheckSavedVehicleId(newRide.vehicle_id);
                            } else {
                              setCheckSavedVehicleId("");
                            }
                          }}
                        >
                          <div class="grid gap-1.5 leading-none w-full">
                            <CheckboxLabel class="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-20">
                              Save for next ride
                            </CheckboxLabel>
                            <CheckboxDescription class="text-xs text-muted-foreground">
                              This vehicle will {checkSavedVehicleId().length > 0 ? "be used" : "not be used"} for the
                              next ride
                            </CheckboxDescription>
                          </div>
                          <CheckboxControl />
                        </Checkbox>
                      </div>
                    </div>
                    <div class="w-full flex flex-col gap-2 border-b border-neutral-300 dark:border-neutral-800 pb-4">
                      <TextFieldRoot
                        class="w-full"
                        value={newRide.departure}
                        onChange={(v) => {
                          setNewRide("departure", v);
                        }}
                      >
                        <TextFieldLabel class="text-sm font-bold">Departure</TextFieldLabel>
                        <TextField class="max-w-full w-full text-left px-3" />
                      </TextFieldRoot>
                      <TextFieldRoot
                        class="w-full"
                        value={newRide.arrival}
                        onChange={(v) => {
                          setNewRide("arrival", v);
                        }}
                      >
                        <TextFieldLabel class="text-sm font-bold">Arrival</TextFieldLabel>
                        <TextField class="max-w-full w-full text-left px-3" />
                      </TextFieldRoot>
                      <div class="flex flex-row items-end justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          class="flex flex-row items-center gap-2 text-sm"
                          disabled={
                            addRideStatus.pending ||
                            calculateDistanceAndChargeSubmission.pending ||
                            newRide.vehicle_id === "" ||
                            newRide.departure.length === 0 ||
                            newRide.arrival.length === 0
                          }
                          onClick={async () => {
                            const dep = newRide.departure;
                            const arr = newRide.arrival;
                            const v = newRide.vehicle_id;
                            if (dep.length === 0 || arr.length === 0) return;
                            const calced = await calculateDistanceAndChargeAction(v, dep, arr, duration());
                            setNewRide("income", String(calced.result));
                            setNewRide("distance", String(calced.distance));
                            setNewRide("vehicle_id", v);
                            if (calced.coords.from && calced.coords.to) {
                              setFromCoords(calced.coords.from);
                              setToCoords(calced.coords.to);
                            }
                            if (!calced.routes) return;
                            setRouteGeometry(calced.routes.geometry);
                          }}
                        >
                          <Show
                            when={!calculateDistanceAndChargeSubmission.pending}
                            fallback={<Loader2 class="size-4 animate-spin" />}
                          >
                            <Map class="size-4" />
                          </Show>
                          <span>Find Route</span>
                        </Button>
                      </div>
                    </div>
                    <div class="w-full flex flex-col gap-2">
                      <NumberField
                        class="w-full"
                        value={duration()}
                        minValue={0}
                        onChange={(v) => {
                          if (v === null) return;
                          if (v === "") v = "0";
                          if (Number(v) < 0) v = "0";
                          if (isNaN(Number(v))) {
                            setDuration(0);
                            return;
                          }
                          setDuration(Number(v));
                        }}
                      >
                        <NumberFieldLabel class="text-sm font-bold">Duration (min)</NumberFieldLabel>
                        <NumberFieldInput class="max-w-full w-full text-left px-3" />
                      </NumberField>
                    </div>
                    <div class="w-full flex flex-col gap-2">
                      <div class="flex flex-row items-center gap-2 justify-between  w-full">
                        <span class="text-sm font-bold">Distance (km)</span>
                        <div class="flex flex-row gap-2 items-baseline justify-between w-max min-w-[200px]">
                          <span class="text-sm font-bold ">Charge</span>
                          <Switcher
                            class="flex items-center space-x-2"
                            checked={isManualCalculation()}
                            onChange={(v) => setIsManualCalculation(v)}
                          >
                            <SwitchControl>
                              <SwitchThumb />
                            </SwitchControl>
                            <SwitchLabel class="text-sm font-medium leading-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70">
                              Manual
                            </SwitchLabel>
                          </Switcher>
                        </div>
                      </div>
                      <div class="flex flex-row w-full border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip shadow-sm">
                        <NumberField
                          class="w-full border-0 "
                          value={newRide.distance}
                          minValue={0}
                          onRawValueChange={(v) => {
                            if (v === null) {
                              setNewRide("distance", String(0));
                              setNewRide("income", String(automatedCalculation()));
                              return;
                            }
                            if (isNaN(Number(v))) {
                              setNewRide("distance", String(0));
                              setNewRide("income", String(automatedCalculation()));
                              return;
                            }
                            setNewRide("distance", String(v));
                            setNewRide("income", String(automatedCalculation()));
                          }}
                        >
                          <NumberFieldInput class="max-w-full w-full border-0 focus-visible:ring-0 shadow-none text-left px-3" />
                        </NumberField>
                        <div class="h-full bg-neutral-300 dark:bg-neutral-800 w-px" />
                        <Show
                          when={!isManualCalculation()}
                          fallback={
                            <NumberField
                              class="w-max border-0 "
                              value={newRide.income}
                              minValue={0}
                              onRawValueChange={(v) => {
                                if (v === null) return;
                                setNewRide("income", String(v));
                              }}
                              format
                              lang={language()}
                              formatOptions={{
                                currency: currency(),
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                style: "currency",
                              }}
                            >
                              <NumberFieldInput class="w-full min-w-[200px] border-0 focus-visible:ring-0 shadow-none text-right px-3" />
                            </NumberField>
                          }
                        >
                          <div class="w-max min-w-[200px] flex flex-row items-center justify-end gap-2 text-sm px-3">
                            <span class="w-max">
                              {new Intl.NumberFormat(language(), {
                                style: "currency",
                                currency: currency(),
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(automatedCalculation())}
                            </span>
                          </div>
                        </Show>
                      </div>
                    </div>
                    <Show when={error()}>{(e) => <div class="text-sm text-red-500">{e()}</div>}</Show>
                  </Show>
                )}
              </Show>
            </div>
          </div>
          <div class="w-full min-w-[600px] flex flex-col gap-4">
            <div class="w-full grow border border-neutral-200 dark:border-neutral-800 rounded-md overflow-clip shadow-sm">
              <Show
                when={
                  newRide.departure.length > 0 &&
                  newRide.arrival.length > 0 &&
                  fromCoords() !== undefined &&
                  toCoords() !== undefined
                }
                fallback={
                  <div class="flex w-full h-full items-center justify-center text-sm text-muted-foreground select-none">
                    Please enter the departure and arrival address.
                  </div>
                }
              >
                <div class="flex flex-col gap-2 w-full h-full">
                  <Show when={fromCoords() && toCoords()}>
                    <ClientRouteMap
                      from={fromCoords}
                      to={toCoords}
                      fallback={
                        <div class="flex flex-col items-center justify-center w-full h-full">
                          <Loader2 class="size-4 animate-spin" />
                        </div>
                      }
                      geometry={routeGeometry}
                    />
                  </Show>
                </div>
              </Show>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              resetForm();
            }}
            class="flex flex-row items-center gap-2"
          >
            <X class="size-4" />
            Cancel
          </Button>
          <Button
            onClick={() => {
              const r = Object.assign({}, newRide);

              const lang = language();
              r.income = r.income;
              r.distance = String(Number(r.distance) * 1000);
              r.rating = String(parseLocaleNumber(lang, r.rating));

              if (!r.vehicle_id || r.vehicle_id === "") {
                toast.error("Please select a vehicle");
                return;
              }

              toast.promise(addRideAction(r, checkSavedVehicleId()), {
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
