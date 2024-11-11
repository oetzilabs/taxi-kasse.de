import type { CreateRide } from "@/lib/api/rides";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import type { CurrencyCode } from "../lib/api/application";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SwitchControl, Switch as Switcher, SwitchLabel, SwitchThumb } from "@/components/ui/switch";
import { addRide, calculateDistanceAndCharge, removeRidesBulk } from "@/lib/api/rides";
import { DialogTriggerProps } from "@kobalte/core/dialog";
import { A, createAsync, useAction, useSubmission } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { createMutation } from "@tanstack/solid-query";
import dayjs from "dayjs";
import FileSpreadsheet from "lucide-solid/icons/file-spreadsheet";
import FileStack from "lucide-solid/icons/file-stack";
import FileText from "lucide-solid/icons/file-text";
import Loader2 from "lucide-solid/icons/loader-2";
import Map from "lucide-solid/icons/map";
import Menu from "lucide-solid/icons/menu";
import Plus from "lucide-solid/icons/plus";
import Trash from "lucide-solid/icons/trash";
import X from "lucide-solid/icons/x";
import { Accessor, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { getVehicles } from "../lib/api/vehicles";
import { cn, parseLocaleNumber } from "../lib/utils";
import { DotNotation, stringify, traverse } from "../utils";
import { language } from "./stores/Language";
import { Button } from "./ui/button";
import { Checkbox, CheckboxControl, CheckboxDescription, CheckboxLabel } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { NumberField, NumberFieldInput, NumberFieldLabel } from "./ui/number-field";
import { TextField, TextFieldLabel, TextFieldRoot } from "./ui/textfield";

const ClientRouteMap = clientOnly(() => import("./ClientRouteMap"));

type DotN = Omit<Rides.Info, "vehicle" | "user" | "routes"> & {
  vehicle: NonNullable<Rides.Info["vehicle"]>;
  createdAt: Date;
};

type RideSelectionMenuProps = {
  selected: Accessor<Array<string>>;
  rides: Accessor<Array<Rides.Info>>;
  toggleSelectAll: () => void;
  company_id: string;
  vehicle_id_used_last_time: string | null;
  vehicle_id_saved: string | null;
  base_charge: number;
  distance_charge: number;
  time_charge: number;
  currency_code: CurrencyCode;
};

export const RideSelectionMenu = (props: RideSelectionMenuProps) => {
  const amount = () => props.selected().length;

  const removeBulkRidesAction = useAction(removeRidesBulk);
  const removeBulkRidesSubmission = useSubmission(removeRidesBulk);
  const [openDeleteModal, setOpenDeleteModal] = createSignal(false);

  const createReport = createMutation(() => ({
    mutationKey: ["ride-selection-menu", "create-report"],
    mutationFn: async () => {
      return { success: true };
    },
  }));

  const createCSV = createMutation(() => ({
    mutationKey: ["ride-selection-menu", "create-csv"],
    mutationFn: async () => {
      const items = props.selected();
      if (items.length === 0) throw Error("Please select rides first");
      const headers: DotNotation<DotN>[] = ["createdAt", "income", "vehicle.name", "distance"];

      // turn data into csv
      let CSV = "";
      const seperator = ";";
      for (let j = 0; j < headers.length; j++) {
        CSV += `${headers[j]}${seperator}`;
      }
      CSV += "\n";
      for (let i = 0; i < props.selected().length; i++) {
        const selectedRide = props.selected()[i];
        const ride = props.rides().find((r) => r.id === selectedRide);
        if (!ride) continue;
        const row: Array<string> = [];
        for (let j = 0; j < headers.length; j++) {
          const k = headers[j];
          // @ts-ignore
          const value = traverse(ride, k);
          if (value !== undefined) {
            row.push(stringify(value));
          } else {
            row.push("");
          }
        }
        CSV += row.join(seperator) + "\n";
      }
      return CSV;
    },
  }));

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

  const [isVehiclePreferred, setIsVehiclePreferred] = createSignal(props.vehicle_id_saved !== null);

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
    setIsVehiclePreferred(false);
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
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger as={Button} class="flex-1 w-max gap-2 size-8 rounded-md" size="icon">
        <Menu class="size-4" />
        {/* <span class="sr-only lg:not-sr-only">Menu</span> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
              <DropdownMenuItem {...props} closeOnSelect={false}>
                <Plus class="size-4" />
                <span>Add Ride</span>
              </DropdownMenuItem>
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
                                    setNewRide("vehicle_id", vehicle.id);
                                    setIsVehiclePreferred(vehicle.preferred);
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
                                        if (vehicle.preferred !== null) {
                                          setIsVehiclePreferred(vehicle.preferred);
                                        }
                                        setNewRide("vehicle_id", vehicle.id);
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
                                setIsVehiclePreferred(true);
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
                                    if (vehicle.preferred !== null) {
                                      setIsVehiclePreferred(vehicle.preferred);
                                    }
                                    setNewRide("vehicle_id", vehicle.id);
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
                              checked={isVehiclePreferred()}
                              onChange={setIsVehiclePreferred}
                            >
                              <div class="grid gap-1.5 leading-none w-full">
                                <CheckboxLabel class="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-20">
                                  Save for next ride
                                </CheckboxLabel>
                                <CheckboxDescription class="text-xs text-muted-foreground">
                                  This vehicle will {isVehiclePreferred() ? "be used" : "not be used"} for the next ride
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
                      <div class="flex flex-col w-full h-full items-center justify-center text-sm text-muted-foreground select-none gap-4 bg-neutral-50 dark:bg-neutral-900/50">
                        <Map class="size-8 opacity-20" />
                        <div class="flex flex-col gap-1 items-center justify-center opacity-50">
                          <span>Please enter a departure</span>
                          <span>and arrival address</span>
                        </div>
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
                  const r = newRide;

                  const lang = language();
                  r.distance = String(Number(r.distance) * 1000);
                  r.rating = String(parseLocaleNumber(lang, r.rating));

                  if (!r.vehicle_id || r.vehicle_id === "") {
                    toast.error("Please select a vehicle");
                    return;
                  }

                  toast.promise(addRideAction(r, isVehiclePreferred()), {
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            props.toggleSelectAll();
          }}
        >
          <FileStack class="size-4" />
          <span>
            <Show when={props.selected().length > 0} fallback={"Select All"}>
              Clear Selection
            </Show>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            toast.promise(createReport.mutateAsync, {
              loading: "Creating Report...",
              success: "Report Created",
              error: "Failed to Create Report",
            });
          }}
          disabled={amount() === 0}
        >
          <FileText class="size-4" />
          <span>Create Report</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={amount() === 0}
          onSelect={async () => {
            toast.promise(createCSV.mutateAsync, {
              loading: "Preparing CSV",
              success(data) {
                const blob = new Blob([data], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `report-${dayjs().format("YYYY-MM-DD")}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return "Downloading CSV";
              },
              error(error) {
                return error.message;
              },
            });
          }}
        >
          <FileSpreadsheet class="size-4" />
          <span>Export to CSV</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Dialog open={openDeleteModal()} onOpenChange={setOpenDeleteModal}>
          <DialogTrigger
            disabled={amount() === 0}
            as={DropdownMenuItem}
            class="flex flex-row items-center gap-2 text-red-500 hover:!bg-red-200 dark:hover:!bg-red-800 hover:!text-red-600 dark:hover:!text-red-500"
            closeOnSelect={false}
          >
            <Trash class="size-4" />
            <span>Delete {amount() === 1 ? "Ride" : "Rides"}</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Delete Ride{amount() === 1 ? "" : "s"}?</DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this selection of rides? This action cannot be undone. All data associated
              with these rides will be deleted.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDeleteModal(false);
                }}
              >
                No, Cancel!
              </Button>
              <Button
                variant="destructive"
                disabled={amount() === 0 || removeBulkRidesSubmission.pending}
                onClick={async () => {
                  const rides = props.selected();
                  toast.promise(removeBulkRidesAction(rides), {
                    loading: "Deleting Rides...",
                    success: "Rides Deleted",
                    error: "Failed to Delete Rides",
                  });
                  setOpenDeleteModal(false);
                }}
              >
                <Show when={removeBulkRidesSubmission.pending} fallback="Yes, Delete">
                  <span class="text-sm">Deleting Rides...</span>
                  <Loader2 class="size-4 animate-spin" />
                </Show>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
