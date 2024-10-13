import type { DropdownMenuTriggerProps } from "@kobalte/core/dropdown-menu";
import type { SelectTriggerProps } from "@kobalte/core/select";
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  VisibilityState,
} from "@tanstack/solid-table";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import type { Vehicles } from "@taxikassede/core/src/entities/vehicles";
import type { VoidProps } from "solid-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxControl } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { removeRideBulk } from "@/lib/api/rides";
import { A, useAction, useSubmission } from "@solidjs/router";
import { compareItems, RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/solid-table";
import dayjs from "dayjs";
import CheckCircle from "lucide-solid/icons/check-circle";
import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import ChevronRight from "lucide-solid/icons/chevron-right";
import ChevronUp from "lucide-solid/icons/chevron-up";
import ChevronDoubleLeft from "lucide-solid/icons/chevrons-left";
import ChevronDoubleRight from "lucide-solid/icons/chevrons-right";
import ChevronUpDown from "lucide-solid/icons/chevrons-up-down";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import Loader2 from "lucide-solid/icons/loader-2";
import Menu from "lucide-solid/icons/menu";
import MinusCircle from "lucide-solid/icons/minus-circle";
import Pencil from "lucide-solid/icons/pencil";
import Trash from "lucide-solid/icons/trash";
import { createMemo, createSignal, For, Match, Show, splitProps, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { language } from "./stores/Language";

declare module "@tanstack/solid-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}
type RidesListProps = {
  rides: Rides.Info[];
};
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const columns: ColumnDef<Rides.Info>[] = [
  {
    id: "selects",
    header: (props) => (
      <Checkbox
        indeterminate={props.table.getIsSomePageRowsSelected()}
        checked={props.table.getIsAllPageRowsSelected()}
        onChange={(value) => props.table.toggleAllPageRowsSelected(value)}
        aria-label="Select all"
        class="mx-1"
      >
        <CheckboxControl />
      </Checkbox>
    ),
    cell: (props) => (
      <Checkbox
        checked={props.row.getIsSelected()}
        onChange={(value) => props.row.toggleSelected(value)}
        aria-label="Select row"
        class="mx-1"
      >
        <CheckboxControl />
      </Checkbox>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: (props) => <TableColumnHeader column={props.column} title="Status" />,
    cell: (props) => (
      <div class="flex w-max gap-2 items-center border rounded-xl px-1.5 py-1">
        <Switch>
          <Match when={props.row.original.status === "cancelled"}>
            <MinusCircle class="size-4 text-muted-foreground" />
          </Match>
          <Match when={props.row.original.status === "accepted"}>
            <CheckCircle class="size-4 text-muted-foreground" />
          </Match>
          <Match when={props.row.original.status === "pending"}>
            <Loader2 class="size-4 animate-spin" />
          </Match>
        </Switch>
        <span class="capitalize text-xs">{props.row.original.status}</span>
      </div>
    ),
    filterFn: "fuzzy",
  },
  {
    id: "vehicle",
    accessorFn: (row) => row.vehicle?.name ?? "No Vehicle",
    header: (props) => <TableColumnHeader column={props.column} title="Vehicle" />,
    cell: (props) => (
      <div class="w-max text-xs">
        <Show when={props.row.original.vehicle} fallback={<span class="w-max text-muted-foreground">No Vehicle</span>}>
          {(v) => <span class="w-max">{v().name}</span>}
        </Show>
      </div>
    ),
    filterFn: "fuzzy",
  },
  {
    accessorKey: "distance",
    header: (props) => <TableColumnHeader column={props.column} title="Distance" />,
    cell: (props) => (
      <div class="flex space-x-2">
        {/* <Badge variant="outline">{props.row.original.distance}</Badge> */}
        <span class="max-w-[250px] truncate font-medium">
          {new Intl.NumberFormat(language(), {
            style: "unit",
            unit: "kilometer",
            unitDisplay: "short",
          }).format(Number(props.row.getValue("distance")) / 1000)}
        </span>
      </div>
    ),
    filterFn: "fuzzy",
  },
  {
    accessorKey: "income",
    header: (props) => <TableColumnHeader column={props.column} title="Charge" />,
    cell: (props) => (
      <div class="flex space-x-2">
        {/* <Badge variant="outline">{props.row.original.distance}</Badge> */}
        <span class="max-w-[250px] truncate font-medium">
          {new Intl.NumberFormat(language(), {
            style: "currency",
            currency: props.row.original.user.currency_code,
            unitDisplay: "long",
          }).format(Number(props.row.getValue("income")))}
        </span>
      </div>
    ),
    filterFn: "fuzzy",
  },
  {
    id: "duration",
    accessorFn: (row) => `${dayjs(row.endedAt).diff(dayjs(row.startedAt), "minute")} minutes`,
    header: (props) => <TableColumnHeader column={props.column} title="Duration" />,
    cell: (props) => {
      const dur = dayjs(props.row.original.endedAt).diff(dayjs(props.row.original.startedAt), "minute");
      return (
        <div class="flex space-x-2">
          <span class="max-w-[250px] truncate font-medium">{dur} minutes</span>
        </div>
      );
    },
    filterFn: "fuzzy",
  },
  {
    id: "actions",
    header: (props) => {
      const removeRideBulkAction = useAction(removeRideBulk);
      const removeRideStatus = useSubmission(removeRideBulk);
      return (
        <div class="flex items-center justify-end">
          <DropdownMenu placement="bottom-end">
            <DropdownMenuTrigger
              as={Button}
              size="sm"
              variant="outline"
              disabled={removeRideStatus.pending || props.table.getSelectedRowModel().rows.length === 0}
            >
              Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  if (removeRideStatus.pending) return;
                  const rows = props.table.getSelectedRowModel().rows;
                  if (rows.length === 0) return;
                  const rides = rows.map((r) => r.original.id);
                  toast.promise(removeRideBulkAction(rides), {
                    loading: "Deleting rides...",
                    success: "Rides deleted",
                    error: "Failed to delete rides",
                  });
                }}
                disabled={props.table.getSelectedRowModel().rows.length === 0 || removeRideStatus.pending}
              >
                <Trash class="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: (props) => (
      <div class="flex items-center justify-end">
        <DropdownMenu placement="bottom-end">
          <DropdownMenuTrigger as={Button} size="icon" class="size-6">
            <Menu class="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem as={A} href={`/dashboard/rides/${props.row.original.id}`} class="flex items-center gap-2">
              <Eye class="size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              as={A}
              href={`/dashboard/rides/${props.row.original.id}/edit`}
              class="flex items-center gap-2"
            >
              <Pencil class="size-4"></Pencil>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="flex items-center gap-2">
              <Trash class="size-4"></Trash>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

const TableColumnHeader = <TData extends Rides.Info, TValue>(
  props: VoidProps<{ column: Column<TData, TValue>; title: string }>,
) => {
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
                  <Switch fallback={<ChevronUpDown class="size-3.5" />}>
                    <Match when={local.column.getIsSorted() === "asc"}>
                      <ChevronUp class="size-3.5" />
                    </Match>
                    <Match when={local.column.getIsSorted() === "desc"}>
                      <ChevronDown class="size-3.5" />
                    </Match>
                  </Switch>
                </div>
              </Button>
            )}
          />
          <DropdownMenuContent>
            <Show when={local.column.getCanSort()}>
              <DropdownMenuItem aria-label="Sort ascending" onClick={() => local.column.toggleSorting(false, true)}>
                <ChevronUpDown class="size-4" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem aria-label="Sort descending" onClick={() => local.column.toggleSorting(true, true)}>
                <ChevronDown class="size-4" />
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
const filteredStatusList = () =>
  (["accepted", "cancelled", "completed", "pending", "rejected"] as Array<Rides.Info["status"]>).map((e) => ({
    title: e,
    value: e,
  }));

export const RidesList = (props: RidesListProps) => {
  const [rowSelection, setRowSelection] = createSignal({});
  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>({});
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([]);
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [globalFilter, setGlobalFilter] = createSignal("");

  const table = createSolidTable({
    get data() {
      return props.rides;
    },
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    globalFilterFn: "fuzzy",
    columns,
    state: {
      get sorting() {
        return sorting();
      },
      get columnVisibility() {
        return columnVisibility();
      },
      get rowSelection() {
        return rowSelection();
      },
      get columnFilters() {
        return columnFilters();
      },
      get globalFilter() {
        return globalFilter();
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div class="w-full space-y-2.5">
      <div class="flex items-center justify-between gap-2">
        <TextFieldRoot>
          <TextField
            type="text"
            placeholder="Filter rides..."
            class="h-8"
            value={globalFilter()}
            onInput={(e) => setGlobalFilter(String(e.currentTarget.value))}
          />
        </TextFieldRoot>
        <div class="flex items-center gap-2">
          <Select
            onChange={(e) => {
              table.getColumn("status")?.setFilterValue(e.length ? e.map((v) => v.value) : undefined);
            }}
            placement="bottom-end"
            sameWidth={false}
            options={filteredStatusList()}
            optionValue="value"
            optionTextValue="title"
            multiple
            itemComponent={(props) => (
              <SelectItem item={props.item} class="capitalize">
                {props.item.rawValue.title}
              </SelectItem>
            )}
          >
            <SelectTrigger
              as={(props: SelectTriggerProps) => (
                <Button
                  {...props}
                  aria-label="Filter status"
                  variant="outline"
                  class="relative flex h-8 w-full gap-2 [&>svg]:hidden"
                >
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 size-4" viewBox="0 0 24 24">
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m12 20l-3 1v-8.5L4.52 7.572A2 2 0 0 1 4 6.227V4h16v2.172a2 2 0 0 1-.586 1.414L15 12v1.5m2.001 5.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0m2-3.5V17m0 4v1.5m3.031-5.25l-1.299.75m-3.463 2l-1.3.75m0-3.5l1.3.75m3.463 2l1.3.75"
                      />
                      <title>Status</title>
                    </svg>
                    Status
                  </div>
                  <SelectValue<ReturnType<typeof filteredStatusList>[0]> class="flex h-full items-center gap-1">
                    {(state) => (
                      <Show
                        when={state.selectedOptions().length <= 2}
                        fallback={
                          <>
                            <Badge class="absolute -top-2 right-0 block size-4 rounded-full p-0 capitalize md:hidden">
                              {state.selectedOptions().length}
                            </Badge>
                            <Badge class="hidden capitalize md:inline-flex py-0 px-1">
                              {state.selectedOptions().length} selected
                            </Badge>
                          </>
                        }
                      >
                        <For each={state.selectedOptions()}>
                          {(item) => (
                            <>
                              <Badge class="absolute -top-2 right-0 block size-4 rounded-full p-0 capitalize md:hidden">
                                {state.selectedOptions().length}
                              </Badge>
                              <Badge class="hidden capitalize md:inline-flex py-0 px-1">{item.title}</Badge>
                            </>
                          )}
                        </For>
                      </Show>
                    )}
                  </SelectValue>
                </Button>
              )}
            />
            <SelectContent />
          </Select>
          <DropdownMenu placement="bottom-end">
            <DropdownMenuTrigger
              as={(props: DropdownMenuTriggerProps) => (
                <Button {...props} aria-label="Toggle columns" variant="outline" class="flex h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 size-4" viewBox="0 0 24 24">
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0" />
                      <path d="M12 18c-3.6 0-6.6-2-9-6c2.4-4 5.4-6 9-6c3.6 0 6.6 2 9 6m-3.999 7a2 2 0 1 0 4 0a2 2 0 1 0-4 0m2-3.5V17m0 4v1.5m3.031-5.25l-1.299.75m-3.463 2l-1.3.75m0-3.5l1.3.75m3.463 2l1.3.75" />
                    </g>
                    <title>View</title>
                  </svg>
                  View
                </Button>
              )}
            />
            <DropdownMenuContent class="w-40">
              <DropdownMenuGroup>
                <DropdownMenuGroupLabel>Toggle columns</DropdownMenuGroupLabel>
                <DropdownMenuSeparator />
                <For
                  each={table
                    .getAllColumns()
                    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())}
                >
                  {(column) => (
                    <DropdownMenuCheckboxItem
                      class="capitalize"
                      checked={column.getIsVisible()}
                      onChange={(value) => column.toggleVisibility(value)}
                    >
                      <span class="truncate">{column.id}</span>
                    </DropdownMenuCheckboxItem>
                  )}
                </For>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div class="rounded-md border w-full flex flex-col h-full">
        <Table class="font-['Geist_Mono',_ui-monospace]">
          <TableHeader>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <TableRow>
                  <For each={headerGroup.headers}>
                    {(header) => {
                      return (
                        <TableHead>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    }}
                  </For>
                </TableRow>
              )}
            </For>
          </TableHeader>
          <TableBody>
            <Show
              when={table.getRowModel().rows?.length}
              fallback={
                <TableRow>
                  <TableCell colSpan={columns.length} class="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              }
            >
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    <For each={row.getVisibleCells()}>
                      {(cell) => <TableCell>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>}
                    </For>
                  </TableRow>
                )}
              </For>
            </Show>
          </TableBody>
        </Table>
      </div>
      <div class="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row font-['Geist_Mono',_ui-monospace]">
        <div class="flex-1 whitespace-nowrap text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div class="flex flex-col-reverse items-center gap-4 sm:flex-row">
          <div class="flex items-center space-x-2">
            <p class="whitespace-nowrap text-sm font-medium">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(value) => value && table.setPageSize(value)}
              options={[10, 20, 30, 40, 50]}
              itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
            >
              <SelectTrigger class="h-8 w-[4.5rem]">
                <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
          <div class="flex items-center justify-center whitespace-nowrap text-sm font-medium gap-2 ">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div class="flex items-center space-x-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              class="flex size-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronDoubleLeft class="size-4" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              size="icon"
              class="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft class="size-4" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              size="icon"
              class="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight class="size-4" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              size="icon"
              class="flex size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronDoubleRight class="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
