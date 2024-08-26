import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenuTriggerProps } from "@kobalte/core/dropdown-menu";
import { SelectTriggerProps } from "@kobalte/core/select";
import {
  ColumnFiltersState,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
} from "@tanstack/solid-table";
import type { Rides } from "@taxikassede/core/src/entities/rides";
import { Accessor, createSignal, For, Show } from "solid-js";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TextField, TextFieldRoot } from "../ui/textfield";
import { EARNINGS_COLUMNS } from "./columns/earnings";

const filteredStatusList = () =>
  (["pending", "accepted", "rejected", "completed", "cancelled", "archived"] satisfies Rides.Info["status"][]).map(
    (e) => ({
      title: e,
      value: e,
    }),
  );

export const EarningsTable = (props: { data: Accessor<Rides.Info[]> }) => {
  const [rowSelection, setRowSelection] = createSignal({});
  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>({});
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([]);
  const [sorting, setSorting] = createSignal<SortingState>([]);

  const table = createSolidTable({
    get data() {
      return props.data();
    },
    columns: EARNINGS_COLUMNS,
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
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div class="w-full flex flex-col">
      <div class="flex items-center justify-between gap-2 w-full p-2">
        <TextFieldRoot>
          <TextField
            type="text"
            placeholder="Filter earnings..."
            class="h-8"
            value={(table.getColumn("income")?.getFilterValue() as string) ?? ""}
            onInput={(e) => table.getColumn("income")?.setFilterValue(e.currentTarget.value)}
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
      <div class="border-y border-neutral-200 dark:border-neutral-800">
        <Table>
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
                  <TableCell colSpan={EARNINGS_COLUMNS.length} class="h-80 text-center">
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
      <div class="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto pl-4 px-2 py-2 sm:flex-row ">
        <div class="flex-1 whitespace-nowrap text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div class="flex flex-col-reverse items-center gap-4 sm:flex-row">
          <div class="flex items-center space-x-2">
            <p class="whitespace-nowrap text-sm font-medium">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(value) => table.setPageSize(value)}
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
