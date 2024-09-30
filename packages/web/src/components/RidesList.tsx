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
import { A } from "@solidjs/router";
import { compareItems, RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/solid-table";
import CheckCircle from "lucide-solid/icons/check-circle";
// import { dataTable } from "./data-table-data";
import Eye from "lucide-solid/icons/eye";
import Loader2 from "lucide-solid/icons/loader-2";
import MinusCircle from "lucide-solid/icons/minus-circle";
import Pencil from "lucide-solid/icons/pencil";
import Trash from "lucide-solid/icons/trash";
import { createMemo, createSignal, For, Match, Show, splitProps, Switch } from "solid-js";
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
        class="translate-y-[2px]"
      >
        <CheckboxControl />
      </Checkbox>
    ),
    cell: (props) => (
      <Checkbox
        checked={props.row.getIsSelected()}
        onChange={(value) => props.row.toggleSelected(value)}
        aria-label="Select row"
        class="translate-y-[2px]"
      >
        <CheckboxControl />
      </Checkbox>
    ),
    enableSorting: false,
    enableHiding: false,
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
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: "status",
    header: (props) => <TableColumnHeader column={props.column} title="Status" />,
    cell: (props) => (
      <div class="flex w-max gap-2 items-center">
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
        <span class="capitalize">{props.row.original.status}</span>
      </div>
    ),
    filterFn: "fuzzy",
  },
  {
    id: "actions",
    cell: (props) => (
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
          <DropdownMenuItem as={A} href={`/dashboard/rides/${props.row.original.id}`} class="flex items-center gap-2">
            <Eye class="size-4"></Eye>
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
                  <Switch
                    fallback={
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m8 9l4-4l4 4m0 6l-4 4l-4-4"
                        />
                      </svg>
                    }
                  >
                    <Match when={local.column.getIsSorted() === "asc"}>
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 5v14m4-10l-4-4M8 9l4-4"
                        />
                      </svg>
                    </Match>
                    <Match when={local.column.getIsSorted() === "desc"}>
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 5v14m4-4l-4 4m-4-4l4 4"
                        />
                      </svg>
                    </Match>
                  </Switch>
                </div>
              </Button>
            )}
          />
          <DropdownMenuContent>
            <Show when={local.column.getCanSort()}>
              <DropdownMenuItem aria-label="Sort ascending" onClick={() => local.column.toggleSorting(false, true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 size-4 text-muted-foreground/70"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v14m4-10l-4-4M8 9l4-4"
                  />
                </svg>
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem aria-label="Sort descending" onClick={() => local.column.toggleSorting(true, true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 size-4 text-muted-foreground/70"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v14m4-4l-4 4m-4-4l4 4"
                  />
                </svg>
                Desc
              </DropdownMenuItem>
            </Show>

            <Show when={local.column.getCanSort() && local.column.getCanHide()}>
              <DropdownMenuSeparator />
            </Show>

            <Show when={local.column.getCanHide()}>
              <DropdownMenuItem aria-label="Hide column" onClick={() => local.column.toggleVisibility(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 size-4 text-muted-foreground/70"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 9c-2.4 2.667-5.4 4-9 4c-3.6 0-6.6-1.333-9-4m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"
                  />
                </svg>
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
      <div class="rounded-md border">
        <Table class=" font-mono">
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
      <div class="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row">
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
          <div class="flex items-center justify-center whitespace-nowrap text-sm font-medium">
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
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m11 7l-5 5l5 5m6-10l-5 5l5 5"
                />
              </svg>
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              size="icon"
              class="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m15 6l-6 6l6 6"
                />
              </svg>
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              size="icon"
              class="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m9 6l6 6l-6 6"
                />
              </svg>
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              size="icon"
              class="flex size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m7 7l5 5l-5 5m6-10l5 5l-5 5"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
