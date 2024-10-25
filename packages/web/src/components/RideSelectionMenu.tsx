import type { Rides } from "@taxikassede/core/src/entities/rides";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { removeRidesBulk } from "@/lib/api/rides";
import { useAction, useSubmission } from "@solidjs/router";
import { createMutation } from "@tanstack/solid-query";
import dayjs from "dayjs";
import FileSpreadsheet from "lucide-solid/icons/file-spreadsheet";
import FileStack from "lucide-solid/icons/file-stack";
import FileText from "lucide-solid/icons/file-text";
import Loader2 from "lucide-solid/icons/loader-2";
import Menu from "lucide-solid/icons/menu";
import Trash from "lucide-solid/icons/trash";
import { Accessor, createSignal, Show } from "solid-js";
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
