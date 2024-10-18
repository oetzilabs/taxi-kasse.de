import type { Rides } from "@taxikassede/core/src/entities/rides";
import { createMutation } from "@tanstack/solid-query";
import dayjs from "dayjs";
import FileSpreadsheet from "lucide-solid/icons/file-spreadsheet";
import FileStack from "lucide-solid/icons/file-stack";
import FileText from "lucide-solid/icons/file-text";
import Menu from "lucide-solid/icons/menu";
import Trash from "lucide-solid/icons/trash";
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
  toggleSelectAll: () => void;
};

export const RideSelectionMenu = (props: RideSelectionMenuProps) => {
  const amount = () => props.selected().length;

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

  return (
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger as={Button} class="flex-1 w-max gap-2" size="sm">
        <Menu class="size-4" />
        <span class="sr-only lg:not-sr-only">Menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            toast.promise(createReport.mutateAsync, {
              loading: "Creating Report...",
              success: "Report Created",
              error: "Failed to Create Report",
            });
          }}
        >
          <FileText class="size-4" />
          <span>Create Report</span>
        </DropdownMenuItem>
        <DropdownMenuItem
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
        <DropdownMenuItem onSelect={() => {}}>
          <Trash class="size-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
