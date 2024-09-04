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
import { A, createAsync, redirect, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import { createSignal, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";

export const route = {
  preload: async (props) => {
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
            onChange={(value) => setV("mileage", value)}
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
              toast.promise(updateVehicleAction(v), {
                loading: "Saving...",
                success: "Saved!",
                error: "Failed to save!",
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

export default function DashboardEditPage() {
  const session = createAsync(() => getAuthenticatedSession());
  const params = useParams();

  const vehicle = createAsync(() => getVehicleById(params.vid));

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-6">
            <div class="flex flex-col w-full items-center justify-center gap-6">
              <Show
                when={vehicle()}
                fallback={
                  <div class="flex flex-col w-full pb-4 gap-4">
                    <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                      <span class="text-sm">You currently have no vehicles.</span>
                      <span class="text-sm">
                        Please{" "}
                        <A href="/dashboard/vehicles/new" class="hover:underline text-blue-500 font-medium">
                          create/join a vehicle
                        </A>{" "}
                        to view your list of vehicles.
                      </span>
                    </div>
                  </div>
                }
              >
                {(vehicle) => <VehicleForm vehicle={vehicle()} />}
              </Show>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
