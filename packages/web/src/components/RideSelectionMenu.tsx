import type { Rides } from "@taxikassede/core/src/entities/rides";
import { createMutation } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { Accessor, Show } from "solid-js";
import { toast } from "solid-sonner";
import { DotNotation, stringify, traverse } from "../utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type DotN = Omit<Rides.Info, "vehicle" | "user" | "routes"> & {
  vehicle: NonNullable<Rides.Info["vehicle"]>;
  createdAt: Date;
};

type RideSelectionMenuProps = {
  selected: Accessor<Array<string>>;
  rides: Accessor<Array<Rides.Info>>;
};

export const RideSelectionMenu = (props: RideSelectionMenuProps) => {
  const amount = () => props.selected().length;

  const createReport = createMutation(() => ({
    mutationKey: ["ride-selection-menu", "create-report"],
    mutationFn: async () => {
      return { success: true };
    },
  }));

  return (
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger as={Button} class="flex-1 w-max gap-2" size="sm" disabled={amount() === 0} variant="outline">
        <Show when={amount() === 0} fallback={<span class="w-max">{amount()} Selected</span>}>
          <span class="w-max">Select Rides</span>
        </Show>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => {
            toast.promise(createReport.mutateAsync, {
              loading: "Creating Report...",
              success: "Report Created",
              error: "Failed to Create Report",
            });
          }}
        >
          Create Report
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
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
            // download csv
            const blob = new Blob([CSV], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `report-${dayjs().format("YYYY-MM-DD")}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => {}}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
