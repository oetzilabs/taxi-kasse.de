import type { Rides } from "@taxikassede/core/src/entities/rides";
import type { DotNotation } from "../utils";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxControl } from "@/components/ui/checkbox";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { cn } from "@/lib/utils";
import { dFormat, traverse } from "@/utils";
import { concat, filter, remove, removeItems } from "@solid-primitives/signal-builders";
import { A, useSearchParams } from "@solidjs/router";
import { UserSession } from "~/lib/auth/util";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ChevronRight from "lucide-solid/icons/chevron-right";
import { Accessor, createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { number, object, optional, parse, string, tuple, union } from "valibot";
import { useRealtime } from "./Realtime";
import { RideSelectionMenu } from "./RideSelectionMenu";
import { language } from "./stores/Language";

dayjs.extend(isBetween);

const querySchema = object({
  duration: optional(union([number(), tuple([number(), number()])])),
  income: optional(union([number(), tuple([number(), number()])])),
  distance: optional(union([number(), tuple([number(), number()])])),
  "vehicle.name": optional(string()),
});

type RealtimeRidesListProps = {
  ridesList: Accessor<Rides.Info[]>;
  currency_code: Accessor<string>;
  session: Accessor<UserSession>;
};

type DotN = Omit<Rides.Info, "vehicle" | "user" | "routes"> & { vehicle: NonNullable<Rides.Info["vehicle"]> };

export const RealtimeRidesList = (props: RealtimeRidesListProps) => {
  const [rides, setRides] = createSignal(props.ridesList());
  const rt = useRealtime();
  const [hiddenMonths, setHiddenMonths] = createSignal<Array<string>>([]);
  const [search, setSearchParams] = useSearchParams();
  const filteredRides = createMemo(() => {
    let query = Array.isArray(search.query) ? search.query[0] || "" : search.query || "";
    const ridesList = rides();

    if (!query) return ridesList;

    // Parse and validate query using Valibot schema
    const parseQuery = (query: string) => {
      const filter: Record<string, any> = {};
      const pairs = query.split(";");

      pairs.forEach((pair) => {
        const [key, value] = pair.split(":");
        if (!key || !value) return;

        if (value.startsWith("[") && value.endsWith("]")) {
          // Convert to array of numbers for range
          filter[key] = value.slice(1, -1).split(",").map(Number);
        } else if (!isNaN(Number(value))) {
          // Parse as single number
          filter[key] = Number(value);
        } else {
          // Parse as string
          filter[key] = value.toLowerCase();
        }
      });

      // Validate and return parsed query based on schema
      return parse(querySchema, filter);
    };

    // Attempt to parse and validate query
    let filters;
    try {
      filters = parseQuery(query);
      console.log(filters);
    } catch (error) {
      console.error("Query validation failed:", error);
      return ridesList;
    }

    const matchesFilter = (ride: Rides.Info) => {
      for (const [key, condition] of Object.entries(filters)) {
        const fieldValue = traverse(ride, key as DotNotation<DotN>);
        if (fieldValue == null) continue;

        if (Array.isArray(condition)) {
          // Range check for array values
          const [min, max] = condition;
          const numericValue = Number(fieldValue);
          if (numericValue < min || numericValue > max) return false;
        } else if (typeof condition === "number") {
          // Exact match for single numbers
          if (Number(fieldValue) !== condition) return false;
        } else {
          // Substring match for string values
          const stringValue = fieldValue.toString().toLowerCase();
          if (!stringValue.includes(condition as string)) return false;
        }
      }
      return true;
    };

    // Using for loop to gather matching rides
    const filteredByQuery: Array<Rides.Info> = [];
    for (let i = 0; i < ridesList.length; i++) {
      const ride = ridesList[i];
      if (ride.deletedAt) continue;

      if (matchesFilter(ride)) {
        filteredByQuery.push(ride);
      }
    }

    return filteredByQuery;
  });

  const sortByStartedAt = (rides: Array<Rides.Info>) => {
    const sortedRides = rides.sort((a, b) => {
      return dayjs(b.startedAt).unix() - dayjs(a.startedAt).unix();
    });
    return sortedRides;
  };

  const groupByMonth = (rides: Array<Rides.Info>) => {
    const months: Record<string, [Array<Rides.Info>, Date]> = {};
    const sorted = sortByStartedAt(rides);
    for (let i = 0; i < sorted.length; i++) {
      const ride = sorted[i];
      const month = dayjs(ride.startedAt).format("MMMM YYYY");
      const d = dayjs(ride.startedAt).toDate();
      if (!months[month]) {
        months[month] = [[ride], d];
        continue;
      }
      months[month][0].push(ride);
    }
    return months;
  };

  createEffect(() => {
    const rs = props.ridesList();
    setRides(rs);
  });

  createEffect(() => {
    if (isServer) {
      console.log("realtime not available on server");
      return;
    }
    const connected = rt.isConnected();
    if (!connected) {
      return;
    } else {
      const unsubRideCreated = rt.subscribe("ride.created", (payload) => {
        // console.log("received system notification", payload);
        // does the ride already exist?
        const filtered = filter(rides, (r) => r.id === payload.id);
        if (filtered().length > 0) {
          return;
        }
        const concatted = concat(rides, payload);
        setRides(concatted());
      });

      const unsubRideDeleted = rt.subscribe("ride.deleted", (payload) => {
        // console.log("received system notification", payload);
        const filtered = filter(rides, (r) => r.id !== payload.id);
        setRides(filtered());
      });

      onCleanup(() => {
        unsubRideCreated();
        unsubRideDeleted();
      });
    }
  });

  let listRef: HTMLDivElement;
  let searchRef: HTMLInputElement;
  const [highlightedRows, setHighlightedRows] = createSignal<string[]>([]);
  const [currentHighlightedRow, setCurrentHighlightedRow] = createSignal<string | undefined>(undefined);

  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStartIndex, setDragStartIndex] = createSignal<number | null>(null);
  const [dragCurrentIndex, setDragCurrentIndex] = createSignal<number | null>(null);

  createEffect(() => {
    if (isServer) {
      return;
    }

    const keydownEventHandler = (event: KeyboardEvent) => {
      const rs = rides();
      const hm = hiddenMonths();
      const rs_without_hiddenMonth = rs.filter((r) => !hm.includes(dFormat(r.createdAt)));
      let rowId = currentHighlightedRow();

      if (event.key === "ArrowDown") {
        if (!rowId) {
          const row = rs_without_hiddenMonth[0];
          if (row) {
            rowId = row.id;
          }
        } else {
          const currentIndex = rs_without_hiddenMonth.findIndex((r) => r.id === rowId);
          const nextRow = rs_without_hiddenMonth[Math.min(rs.length, currentIndex + 1)];
          if (nextRow) {
            rowId = nextRow.id;
          }
        }
      }

      if (event.key === "ArrowUp") {
        if (!rowId) {
          const row = rs_without_hiddenMonth[0];
          if (row) {
            rowId = row.id;
          }
        } else {
          const currentIndex = rs_without_hiddenMonth.findIndex((r) => r.id === rowId);
          const nextRow = rs_without_hiddenMonth[Math.max(0, currentIndex - 1)];
          if (nextRow) {
            rowId = nextRow.id;
          }
        }
      }

      if (event.key === "Escape") {
        rowId = undefined;
        setHighlightedRows([]);
      }

      // if (event.key === "s" || event.key === " ") {
      //   if (searchRef && !searchRef.contains(event.target as Node)) event.preventDefault();
      //   const hr = highlightedRows();
      //   if (rowId) {
      //     if (hr.includes(rowId)) {
      //       const removed = remove(highlightedRows, rowId);
      //       setHighlightedRows(removed());
      //     } else {
      //       const concatted = concat(highlightedRows, rowId);
      //       setHighlightedRows(concatted());
      //     }
      //   }
      // }
      setCurrentHighlightedRow(rowId);
    };

    const keyupEventHandler = (event: KeyboardEvent) => {};

    const mouseClickOutsideOfList = (event: MouseEvent) => {
      if (listRef && listRef.contains(event.target as Node)) return;
      // setHighlightedRows([]);
      setCurrentHighlightedRow(undefined);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (listRef && listRef.contains(event.target as Node)) {
        setIsDragging(true);
        const targetIndex = getElementIndexFromEvent(event);
        if (targetIndex !== null) {
          setDragStartIndex(targetIndex);
          setDragCurrentIndex(targetIndex);
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging()) {
        const targetIndex = getElementIndexFromEvent(event);
        if (targetIndex !== null && targetIndex !== dragCurrentIndex()) {
          setDragCurrentIndex(targetIndex);

          // Determine range between start and current index for selection
          const start = Math.min(dragStartIndex()!, targetIndex);
          const end = Math.max(dragStartIndex()!, targetIndex);

          const rs_without_hiddenMonth = rides().filter((r) => !hiddenMonths().includes(dFormat(r.createdAt)));

          const draggedRows = rs_without_hiddenMonth.slice(start, end + 1).map((r) => r.id);
          setHighlightedRows(draggedRows);
        }
      }
    };

    const onMouseUp = () => {
      if (isDragging()) {
        setIsDragging(false);
        setDragStartIndex(null);
        setDragCurrentIndex(null);
      }
    };

    const getElementIndexFromEvent = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const rideElement = target.closest("[data-ride-id]") as HTMLElement | null;
      if (rideElement) {
        return Array.from(listRef!.querySelectorAll("[data-ride-id]")).indexOf(rideElement);
      }
      return null;
    };

    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("click", mouseClickOutsideOfList);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    onCleanup(() => {
      window.removeEventListener("keydown", keydownEventHandler);
      window.removeEventListener("click", mouseClickOutsideOfList);
      window.removeEventListener("keyup", keyupEventHandler);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    });
  });

  return (
    <div class="gap-0 w-full grow">
      <div class="flex flex-col gap-0 w-full grow">
        <div class="flex flex-row items-center justify-between gap-0">
          <div class="flex flex-row items-center gap-4 w-min"></div>
          <div class="flex flex-row items-center gap-4 w-full">
            <TextFieldRoot
              value={Array.isArray(search.query) ? search.query.join(", ") : search.query || ""}
              onChange={(v) =>
                setSearchParams({
                  query: v,
                })
              }
              class="w-full max-w-full rounded-xl "
              disabled
            >
              <TextField
                ref={searchRef!}
                placeholder={`Search across ${filteredRides().length} rides`}
                class="w-full max-w-full text-xs h-8 bg-neutral-100 dark:bg-neutral-900 !shadow-none"
              />
            </TextFieldRoot>
            <div class="flex flex-row items-center gap-2">
              {/* <RideFilters filterValue={filterValue} onFilterChange={setFilterValue} /> */}
              <Show when={props.session().company?.id}>
                {(id) => (
                  <RideSelectionMenu
                    selected={highlightedRows}
                    records={rides}
                    toggleSelectAll={() => {
                      const someSelected = highlightedRows().length > 0;
                      if (someSelected) {
                        setHighlightedRows([]);
                      } else {
                        setHighlightedRows(filteredRides().map((r) => r.id));
                      }
                    }}
                    company_id={id()}
                    vehicle_id_saved={null}
                    vehicle_id_used_last_time={null}
                    base_charge={Number(props.session().company?.base_charge)}
                    distance_charge={Number(props.session().company?.distance_charge)}
                    time_charge={Number(props.session().company?.time_charge)}
                    currency_code={props.session().user?.currency_code ?? "USD"}
                  />
                )}
              </Show>
            </div>
          </div>
        </div>
        <Show when={filteredRides()}>
          {(_rides) => (
            <div class="h-max w-full flex flex-col" ref={listRef!}>
              <For
                each={Object.entries(groupByMonth(_rides()))}
                fallback={
                  <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl mt-4">
                    <span class="text-muted-foreground">There are currently no rides</span>
                  </div>
                }
              >
                {([month, [rides, d]], i) => (
                  <div class="flex flex-col gap-0 w-full">
                    <div
                      class={cn("flex flex-row items-center w-full px-0 py-4", {
                        "pb-0": hiddenMonths().includes(dFormat(d)),
                      })}
                    >
                      <div class="flex flex-row items-center w-16">
                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                      <div
                        class="text-xs text-muted-foreground w-max font-medium select-none hover:underline cursor-pointer px-2 flex flex-1"
                        onClick={() => {
                          const rIds = rides.map((rs) => rs.id);
                          const toBeAdded = rides.filter((r) => !highlightedRows().includes(r.id)).map((rs) => rs.id);
                          if (toBeAdded.length > 0) {
                            const concatted = concat(highlightedRows, toBeAdded);
                            setHighlightedRows(concatted());
                          } else {
                            const filtered = removeItems(highlightedRows(), ...rIds);
                            setHighlightedRows(filtered());
                          }
                        }}
                      >
                        <span class="w-max">
                          <Show
                            when={rides.filter((r) => highlightedRows().includes(r.id)).length === rides.length}
                            fallback="Select All"
                          >
                            Clear Selection
                          </Show>
                        </span>
                      </div>
                      <div class="flex flex-row items-center w-full">
                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                      <div class="flex flex-row items-center w-max px-2 gap-1">
                        <span class="text-xs text-muted-foreground w-max font-medium select-none">
                          <Show
                            when={dFormat(d) === month}
                            fallback={`${month} - ${rides.length} Ride${rides.length > 1 ? "s" : ""}`}
                          >
                            This Month - {rides.length} Ride{rides.length > 1 ? "s" : ""}
                          </Show>
                        </span>
                      </div>
                      <div class="flex flex-row items-center w-full">
                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                      <div
                        class="text-xs text-muted-foreground w-max font-medium select-none hover:underline cursor-pointer px-2 flex flex-1"
                        onClick={() => {
                          const df = dFormat(d);
                          const isH = hiddenMonths().includes(df);
                          if (isH) {
                            setHiddenMonths(hiddenMonths().filter((m) => m !== df));
                          } else {
                            const concatted = concat(hiddenMonths, df);
                            setHiddenMonths(concatted());
                          }
                        }}
                      >
                        <Show when={!hiddenMonths().includes(dFormat(d))} fallback="Show">
                          Hide
                        </Show>
                      </div>
                      <div class="flex flex-row items-center w-16">
                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                    </div>
                    <Show when={!hiddenMonths().includes(dFormat(d))}>
                      <div class="w-full flex flex-col overflow-clip">
                        <For
                          each={rides}
                          fallback={
                            <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                              <span class="text-muted-foreground">There are currently no rides</span>
                            </div>
                          }
                        >
                          {(ride, rideIndex) => (
                            <div
                              data-ride-id={ride.id}
                              class={cn(
                                "h-max w-full flex flex-col border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
                                {
                                  // Highlighted Row Styles
                                  "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950":
                                    highlightedRows().includes(ride.id),
                                  "border-blue-500 dark:border-blue-500": currentHighlightedRow() === ride.id,

                                  // Remove top border if the previous row is also highlighted
                                  "!border-t-transparent":
                                    rideIndex() > 0 &&
                                    highlightedRows().includes(rides[rideIndex() - 1].id) &&
                                    currentHighlightedRow() !== ride.id,

                                  // Apply rounded corners to first and last items only if not highlighted
                                  "rounded-t-2xl": rideIndex() === 0,
                                  "rounded-b-2xl": rideIndex() === rides.length - 1,

                                  // Remove bottom border if the next row is highlighted
                                  "!border-b-blue-200/50 dark:!border-b-blue-900/50":
                                    rideIndex() < rides.length - 1 &&
                                    highlightedRows().includes(rides[rideIndex() + 1].id) &&
                                    currentHighlightedRow() !== ride.id,
                                },
                                {
                                  "!border-b-transparent":
                                    rideIndex() < rides.length - 1 &&
                                    !highlightedRows().includes(ride.id) &&
                                    currentHighlightedRow() !== ride.id,
                                },
                              )}
                            >
                              <div class="flex flex-row w-full p-4 py-2 items-center justify-between">
                                <div class="flex items-center justify-center select-none gap-4">
                                  <div class="flex flex-row items-center gap-4">
                                    <Checkbox
                                      checked={highlightedRows().includes(ride.id)}
                                      onChange={(value) => {
                                        if (value) {
                                          setHighlightedRows(concat(highlightedRows, ride.id));
                                        } else {
                                          setHighlightedRows(remove(highlightedRows, ride.id));
                                        }
                                        setCurrentHighlightedRow(ride.id);
                                      }}
                                    >
                                      <CheckboxControl />
                                    </Checkbox>
                                  </div>
                                  <div class="flex flex-row items-center">
                                    <Show
                                      when={ride.vehicle}
                                      fallback={
                                        <span class="text-sm font-bold font-['Geist_Mono',_ui-monospace]">Unknown</span>
                                      }
                                    >
                                      {(v) => <span class="text-sm font-bold">{v().name}</span>}
                                    </Show>
                                  </div>
                                  <div class="flex flex-row w-max gap-2 select-none items-center">
                                    <div class="flex flex-row items-center w-max">
                                      <span class="text-sm text-muted-foreground w-max">
                                        {new Intl.NumberFormat(language(), {
                                          style: "unit",
                                          unit: "kilometer",
                                          unitDisplay: "short",
                                        }).format(Number(ride.distance) / 1000)}
                                      </span>
                                    </div>
                                    <div class="flex flex-row items-center w-max">
                                      <span class="text-sm text-muted-foreground w-max">
                                        {new Intl.NumberFormat(language(), {
                                          style: "unit",
                                          unit: "minute",
                                          unitDisplay: "short",
                                        }).format(Number(dayjs(ride.startedAt).diff(ride.endedAt, "minute")))}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div class="w-max flex flex-row items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    class="flex flex-row items-center gap-2 leading-none select-none"
                                    as={A}
                                    href={`/dashboard/rides/${ride.id}`}
                                  >
                                    <span class="font-bold sr-only sm:not-sr-only">
                                      {new Intl.NumberFormat(language(), {
                                        style: "currency",
                                        currency: props.currency_code(),
                                      }).format(Number(ride.income))}
                                    </span>
                                    <Show
                                      when={
                                        ride.payment !== undefined &&
                                        Number(ride.payment!.tip) !== 0 &&
                                        Number(ride.payment!.tip)
                                      }
                                    >
                                      {(tip) => (
                                        <span class="sr-only sm:not-sr-only">
                                          {new Intl.NumberFormat(language(), {
                                            style: "currency",
                                            currency: props.currency_code(),
                                            unitDisplay: "short",
                                          }).format(Number(tip() ?? 0))}
                                        </span>
                                      )}
                                    </Show>
                                    <ChevronRight class="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
};
