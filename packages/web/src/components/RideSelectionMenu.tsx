import { createMutation } from "@tanstack/solid-query";
import { Accessor, Show } from "solid-js";
import { toast } from "solid-sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type RideSelectionMenuProps = {
  selected: Accessor<Array<string>>;
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
        <DropdownMenuItem onSelect={() => {}}>Export to CSV</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => {}}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
