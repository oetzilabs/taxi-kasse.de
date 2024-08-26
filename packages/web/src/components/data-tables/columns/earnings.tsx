import { Arrow, DropdownMenuTriggerProps } from "@kobalte/core/dropdown-menu";
import { Column, ColumnDef } from "@tanstack/solid-table";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import ArrowDown from "lucide-solid/icons/arrow-down";
import ArrowUp from "lucide-solid/icons/arrow-up";
import ArrowUpDown from "lucide-solid/icons/arrow-up-down";
import EyeOff from "lucide-solid/icons/eye-off";
import { Match, Show, splitProps, Switch, VoidProps } from "solid-js";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Checkbox, CheckboxControl } from "../../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const TableColumnHeader = <TData, TValue>(props: VoidProps<{ column: Column<TData, TValue>; title: string }>) => {
  const [local] = splitProps(props, ["column", "title"]);

  return (
    <Show
      when={local.column.getCanSort() && local.column.getCanHide()}
      fallback={<span class="text-sm font-medium">{local.title}</span>}
    >
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            as={(props: DropdownMenuTriggerProps) => (
              <Button
                aria-label={
                  local.column.getIsSorted() === "desc"
                    ? "Sorted descending. Click to sort ascending."
                    : local.column.getIsSorted() === "asc"
                      ? "Sorted ascending. Click to sort descending."
                      : "Not sorted. Click to sort ascending."
                }
                variant="ghost"
                class="-ml-4 h-8 data-[expanded]:bg-accent"
                {...props}
              >
                <span>{local.title}</span>
                <div class="ml-1">
                  <Switch fallback={<ArrowUpDown class="size-4" />}>
                    <Match when={local.column.getIsSorted() === "asc"}>
                      <ArrowUp class="size-4" />
                    </Match>
                    <Match when={local.column.getIsSorted() === "desc"}>
                      <ArrowDown class="size-4" />
                    </Match>
                  </Switch>
                </div>
              </Button>
            )}
          />
          <DropdownMenuContent>
            <Show when={local.column.getCanSort()}>
              <DropdownMenuItem aria-label="Sort ascending" onClick={() => local.column.toggleSorting(false, true)}>
                <ArrowUp class="size-4" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem aria-label="Sort descending" onClick={() => local.column.toggleSorting(true, true)}>
                <ArrowDown class="size-4" />
                Desc
              </DropdownMenuItem>
            </Show>

            <Show when={local.column.getCanSort() && local.column.getCanHide()}>
              <DropdownMenuSeparator />
            </Show>

            <Show when={local.column.getCanHide()}>
              <DropdownMenuItem aria-label="Hide column" onClick={() => local.column.toggleVisibility(false)}>
                <EyeOff class="size-4" />
                Hide
              </DropdownMenuItem>
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Show>
  );
};
export const EARNINGS_COLUMNS: ColumnDef<Rides.Info>[] = [
  {
    id: "selects",
    header: (props) => (
      <div class="px-2">
        <Checkbox
          indeterminate={props.table.getIsSomePageRowsSelected()}
          checked={props.table.getIsAllPageRowsSelected()}
          onChange={(value) => props.table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
          class=""
        >
          <CheckboxControl />
        </Checkbox>
      </div>
    ),
    cell: (props) => (
      <div class="px-2">
        <Checkbox
          checked={props.row.getIsSelected()}
          onChange={(value) => props.row.toggleSelected(value)}
          aria-label="Select row"
          class=""
        >
          <CheckboxControl />
        </Checkbox>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "income",
    header: (props) => <TableColumnHeader column={props.column} title="Income" />,
    cell: (props) => (
      <div class="flex space-x-2">
        <Badge variant="outline">{props.row.original.income}</Badge>
        <span class="max-w-[250px] truncate font-medium">{props.row.getValue("income")}</span>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: (props) => <TableColumnHeader column={props.column} title="Rating" />,
    cell: (props) => (
      <div class="flex w-[100px] items-center">
        <span class="capitalize">{props.row.original.rating}</span>
      </div>
    ),
  },
  {
    accessorKey: "distance",
    header: (props) => <TableColumnHeader column={props.column} title="Distance" />,
    cell: (props) => (
      <div class="flex w-[100px] items-center">
        <span class="capitalize">{props.row.original.distance}</span>
      </div>
    ),
  },
  {
    accessorKey: "vehicle_id",
    header: (props) => <TableColumnHeader column={props.column} title="Vehicle" />,
    cell: (props) => (
      <div class="flex w-[100px] items-center">
        <span class="capitalize">
          {props.row.original.vehicle.name} ({props.row.original.vehicle.model})
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu placement="bottom-end">
        <DropdownMenuTrigger class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"
            />
            <title>Action</title>
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
