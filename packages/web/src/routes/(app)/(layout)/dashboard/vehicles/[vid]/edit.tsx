import type { Vehicles } from "@taxikassede/core/src/entities/vehicles";
import { Button } from "@/components/ui/button";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "@/components/ui/number-field";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getVehicleById, updateVehicle } from "@/lib/api/vehicles";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, RouteSectionProps, useAction, useSubmission } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import { Match, Show, Suspense, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const vehicle = getVehicleById(props.params.vid);
    return { session, vehicle };
  },
  load: async (props) => {
    const session = await getAuthenticatedSession();
    const vehicle = getVehicleById(props.params.vid);
    return { session, vehicle };
  },
} satisfies RouteDefinition;

const VehicleForm = (props: { vehicle: Vehicles.Info }) => {
  const [v, setV] = createStore(props.vehicle);
  const updateVehicleAction = useAction(updateVehicle);
  const updateVehicleState = useSubmission(updateVehicle);
  return (
    <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-col p-6 gap-6">
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            defaultValue={props.vehicle.name}
            name="name"
            onChange={(value) => setV("name", value)}
            disabled={updateVehicleState.pending}
          >
            <TextFieldLabel class="font-bold">Name</TextFieldLabel>
            <TextField />
          </TextFieldRoot>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <NumberField
            defaultValue={props.vehicle.mileage}
            name="mileage"
            formatOptions={{
              style: "decimal",
              unit: "kilometer",
              unitDisplay: "narrow",
            }}
            onRawValueChange={(value) => {
              setV("mileage", String(value));
            }}
            // onChange={(value) => {
            //   const pN = parseLocaleNumber(language(), value);
            //   setV("mileage", String(pN));
            // }}
            disabled={updateVehicleState.pending}
          >
            <NumberFieldLabel class="font-bold">Mileage (km)</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldDecrementTrigger aria-label="Decrement" />
              <NumberFieldInput />
              <NumberFieldIncrementTrigger aria-label="Increment" />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <div class="flex flex-row items-center justify-end gap-4">
          <Button
            class="w-max"
            disabled={updateVehicleState.pending}
            onClick={() => {
              if (!v.id) {
                toast.error("Failed to save! Please fill out all fields.");
                return;
              }

              // const saveV = { ...v, overwrite_base_charge: Number(v.overwrite_base_charge)} satisfies Parameters<typeof updateVehicleAction>[0];
              const saveV = {
                ...v,
                overwrite_base_charge: Number(v.overwrite_base_charge),
                overwrite_distance_charge: Number(v.overwrite_distance_charge),
                overwrite_time_charge: Number(v.overwrite_time_charge),
              } satisfies Parameters<typeof updateVehicleAction>[0];

              toast.promise(updateVehicleAction(saveV), {
                loading: "Saving...",
                success: "Saved!",
                error: (e) => `Failed to save! ${e.message}`,
              });
            }}
          >
            <Switch fallback={<span>Save</span>}>
              <Match when={updateVehicleState.pending}>
                <span>Saving...</span>
              </Match>
            </Switch>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardEditPage(props: RouteSectionProps) {
  const session = createAsync(() => getAuthenticatedSession());

  const vehicle = createAsync(() => getVehicleById(props.params.vid));

  return (
    <div class="w-full grow flex flex-col">
      <Suspense
        fallback={
          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
            <Loader2 class="size-4 animate-spin" />
          </div>
        }
      >
        <Show when={session()}>
          {(s) => (
            <div class="flex flex-col w-full py-4 gap-6">
              <div class="flex flex-col w-full items-center justify-center gap-6">
                <Suspense
                  fallback={
                    <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                      <Loader2 class="size-4 animate-spin" />
                    </div>
                  }
                >
                  <Show
                    when={vehicle() && vehicle()}
                    fallback={
                      <div class="flex flex-col w-full pb-4 gap-4">
                        <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                          <span class="text-sm">You currently have no vehicles.</span>
                          <span class="text-sm">
                            Please{" "}
                            <A href="/dashboard/vehicles/new" class="hover:underline text-blue-500 font-medium">
                              create a vehicle
                            </A>{" "}
                            to view your list of vehicles.
                          </span>
                        </div>
                      </div>
                    }
                  >
                    {(vehicle) => <VehicleForm vehicle={vehicle()} />}
                  </Show>
                </Suspense>
              </div>
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
