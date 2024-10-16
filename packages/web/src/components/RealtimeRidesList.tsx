import type { Rides } from "@taxikassede/core/src/entities/rides";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { concat, remove } from "@solid-primitives/signal-builders";
import { A, revalidate, useSearchParams } from "@solidjs/router";
import dayjs from "dayjs";
import ChevronRight from "lucide-solid/icons/chevron-right";
import RotateClockwise from "lucide-solid/icons/rotate-cw";
import { Accessor, createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { Transition } from "solid-transition-group";
import { getLanguage } from "../lib/api/application";
import { getRides } from "../lib/api/rides";
import { getStatistics } from "../lib/api/statistics";
import { cn } from "../lib/utils";
import { useRealtime } from "./Realtime";
import { FilterValue, RideFilters } from "./RidesFilter";
import { language } from "./stores/Language";
import { Checkbox, CheckboxControl } from "./ui/checkbox";

type RealtimeRidesListProps = {
  ridesList: Accessor<Rides.Info[]>;
  currency_code: Accessor<string>;
};

type DotNotation<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? DotNotation<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`>
    : `${Prefix}${Prefix extends "" ? "" : "."}${Extract<K, string>}`;
}[keyof T];

//` keep this here... neovim struggles with the highlighting

const stringify = <T extends any>(obj: T) => {
  const t = typeof obj;
  if (t === "string") return obj as string;
  if (t === "number") return (obj as number).toString();
  if (t === "boolean") return (obj as boolean).toString();
  if (t === "object") {
    if (obj === null) return "null";
    if (Array.isArray(obj)) {
      const arr: Array<string> = [];
      for (let i = 0; i < obj.length; i++) {
        arr.push(stringify(obj[i]));
      }
      return `[${arr.join(",")}]`;
    }
    const o = obj as Record<string, unknown>;
    const objKeys = Object.keys(o);
    const objValues: any[] = objKeys.map((k) => stringify(o[k]));
    return `{${objKeys.map((k, i) => `${k}:${objValues[i]}`).join(",")}}`;
  }
  return "null";
};

type DotN = Omit<Rides.Info, "vehicle" | "user" | "routes"> & { vehicle: NonNullable<Rides.Info["vehicle"]> };

const dFormat = (d: Date) => dayjs(d).format("MMMM-YYYY");

const traverse = <T extends DotN>(obj: any, path: DotNotation<T>) => {
  // @ts-ignore
  const paths = path.split(".");
  let current = obj;
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (current[path] === undefined) {
      return undefined;
    }
    current = current[path];
  }
  return current;
};

export const RealtimeRidesList = (props: RealtimeRidesListProps) => {
  const [rides, setRides] = createSignal(props.ridesList());
  const rt = useRealtime();
  const [search, setSearchParams] = useSearchParams();
  const [hiddenMonths, setHiddenMonths] = createSignal<Array<string>>([]);
  const [filterValue, setFilterValue] = createSignal<FilterValue>({
    dateRange: undefined,
    duration: undefined,
    distance: undefined,
    income: undefined,
    status: undefined,
    rideType: undefined,
  });

  const filteredRides = createMemo(() => {
    if (!search.query) return rides();
    const fieldValues = filterValue();
    const fields: Array<DotNotation<DotN>> = ["id", "added_by", "income", "vehicle.name", "distance"];

    const found: Array<Rides.Info> = [];
    const rs = rides();
    for (let i = 0; i < rs.length; i++) {
      const ride = rs[i];
      if (ride.deletedAt) {
        continue;
      }
      // if (ride.vehicle === null) {
      //   continue;
      // }
      for (let j = 0; j < fields.length; j++) {
        const k = fields[j];
        // @ts-ignore
        const value = traverse(ride, k);
        if (value !== undefined) {
          if (value.toLowerCase().includes(search.query.toLowerCase())) {
            found.push(ride);
          }
        }
      }
    }

    // use the filterValues to find the rides.
    const found2: Array<Rides.Info> = [];
    const ff = Object.values(fieldValues).filter((v) => v !== undefined);
    if (ff.length === 0) return found;
    const fields2 = Object.entries(fieldValues);
    for (let i = 0; i < found.length; i++) {
      const ride = rs[i];

      keyVLoop: for (const [key, value] of fields2) {
        if (!value) continue keyVLoop;
        switch (key) {
          case "dateRange":
            const vStartEnd = value as { start?: string; end?: string };
            if (vStartEnd.start && vStartEnd.end) {
              if (dayjs(ride.startedAt).isAfter(vStartEnd.start) && dayjs(ride.startedAt).isBefore(vStartEnd.end)) {
                found2.push(ride);
              }
            }
            break;
          case "duration":
            const vDuration = value as [number, number];
            const duration = Math.abs(dayjs(ride.endedAt).diff(ride.startedAt, "minute"));
            if (duration >= vDuration[0] && duration <= vDuration[1]) {
              found2.push(ride);
            }
            break;
          case "distance":
            const vDistance = value as [number, number];
            if (Number(ride.distance) >= vDistance[0] && Number(ride.distance) <= vDistance[1]) {
              found2.push(ride);
            }
            break;
          case "income":
            const vIncome = value as [number, number];
            if (Number(ride.income) >= vIncome[0] && Number(ride.income) <= vIncome[1]) {
              found2.push(ride);
            }
            break;
          case "status":
            const vStatus = value as string[];
            if (ride.status && vStatus.includes(ride.status)) {
              found2.push(ride);
            }
            break;
          case "rideType":
            break;
          case "vehicleTypes":
            break;
          default:
            console.info("nothing found");
            break;
        }
      }
    }
    return found2;
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
      console.log("realtime not connected");
      return;
    } else {
      const subs = rt.subscriptions();
      if (subs.has("ride.created")) {
        console.log("realtime already subscribed to ride.created, skipping");
        return;
      }

      // console.log("realtime connected");
      rt.subscribe("ride.created", (payload) => {
        // console.log("received system notification", payload);
        const concatted = concat(rides, payload);
        setRides(concatted());
      });

      onCleanup(() => {
        rt.unsubscribe("ride.created");
      });
    }
  });

  let listRef: HTMLDivElement;
  let searchRef: HTMLInputElement;
  const [highlightedRows, setHighlightedRows] = createSignal<string[]>([]);
  const [currentHighlightedRow, setCurrentHighlightedRow] = createSignal<string | undefined>(undefined);

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

      if (event.key === "s" || event.key === " ") {
        if (searchRef && !searchRef.contains(event.target as Node)) event.preventDefault();
        const hr = highlightedRows();
        if (rowId) {
          if (hr.includes(rowId)) {
            const removed = remove(highlightedRows, rowId);
            setHighlightedRows(removed());
          } else {
            const concatted = concat(highlightedRows, rowId);
            setHighlightedRows(concatted());
          }
        }
      }
      setCurrentHighlightedRow(rowId);
    };

    const keyupEventHandler = (event: KeyboardEvent) => {};

    const mouseClickOutsideOfList = (event: MouseEvent) => {
      // if (listRef && listRef.contains(event.target as Node)) return;
      // setHighlightedRows([]);
      // setCurrentHighlightedRow(undefined);
    };

    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("click", mouseClickOutsideOfList);
    window.addEventListener("keyup", keyupEventHandler);

    onCleanup(() => {
      window.removeEventListener("keydown", keydownEventHandler);
      window.removeEventListener("click", mouseClickOutsideOfList);
      window.removeEventListener("keyup", keyupEventHandler);
    });
  });

  return (
    <div class="gap-0 w-full grow">
      <div class="flex flex-col gap-2 w-full grow">
        <div class="flex flex-row items-center justify-between gap-0">
          <div class="flex flex-row items-center gap-4 w-min"></div>
          <div class="flex flex-row items-center gap-4 w-full">
            <TextFieldRoot
              value={search.query}
              onChange={(v) =>
                setSearchParams({
                  query: v,
                })
              }
              class="w-full max-w-full"
            >
              <TextField
                ref={searchRef!}
                placeholder={`Search across ${filteredRides().length} rides`}
                class="w-full max-w-full h-8 text-xs"
              />
            </TextFieldRoot>
            <RideFilters filterValue={filterValue()} onFilterChange={setFilterValue} />
            <Button
              size="sm"
              class="flex flex-row items-center gap-2 select-none size-8 md:size-auto p-2 md:px-3 md:py-2"
              variant="secondary"
              onClick={async () => {
                await revalidate([getRides.key, getLanguage.key, getStatistics.key]);
              }}
            >
              <span class="sr-only md:not-sr-only">Refresh</span>
              <RotateClockwise class="size-4" />
            </Button>
            {/* <AddRideModal
                vehicle_id_saved={null}
                vehicle_id_used_last_time={null}
                base_charge={Number(c().base_charge)}
                distance_charge={Number(c().distance_charge)}
                time_charge={Number(c().time_charge)}
                currency_code={s().user?.currency_code ?? "USD"}
                /> */}
          </div>
        </div>
        <Show when={filteredRides()}>
          {(_rides) => (
            <div class="h-max w-full flex flex-col" ref={listRef!}>
              <For
                each={Object.entries(groupByMonth(_rides()))}
                fallback={
                  <div class="h-40 w-full flex flex-col items-center justify-center select-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <span class="text-muted-foreground">There are currently no rides</span>
                  </div>
                }
              >
                {([month, [rides, d]], i) => (
                  <div class="flex flex-col gap-0 w-full">
                    <div
                      class={cn("flex flex-row items-center w-full px-8 py-4 transition-[padding] duration-300", {
                        "px-0": i() === 0 || hiddenMonths().includes(dFormat(d)),
                        "pb-0": hiddenMonths().includes(dFormat(d)),
                      })}
                    >
                      <div class="flex flex-row items-center w-full">
                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                      <div class="flex flex-row items-center w-max px-2 gap-1">
                        <span class="text-xs text-muted-foreground w-max font-medium select-none">
                          <Show
                            when={i() === 0}
                            fallback={`${month} - ${rides.length} Ride${rides.length > 1 ? "s" : ""}`}
                          >
                            This Month - {rides.length} Ride{rides.length > 1 ? "s" : ""}
                          </Show>
                        </span>
                        <span class="text-xs text-muted-foreground w-max font-medium select-none">-</span>
                        <div
                          class="text-xs text-muted-foreground w-max font-medium select-none hover:underline cursor-pointer"
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
                      </div>
                      <div class="flex flex-row items-center w-full">
                        <div class="h-px flex-1 flex bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                    </div>
                    <Transition name="slide-fade-up">
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
                                class={cn(
                                  "h-max w-full flex flex-col border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
                                  {
                                    "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950":
                                      highlightedRows().includes(ride.id),
                                    "border-blue-500 dark:border-blue-500": currentHighlightedRow() === ride.id,
                                    "rounded-t-2xl": rideIndex() === 0,
                                    "rounded-b-2xl": rideIndex() === rides.length - 1,
                                    "!border-t-transparent":
                                      rideIndex() !== 0 &&
                                      currentHighlightedRow() !== ride.id &&
                                      !highlightedRows().includes(ride.id),
                                  },
                                )}
                              >
                                <div class="flex flex-row w-full p-6 items-center justify-between">
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
                                          <span class="text-sm font-bold font-['Geist_Mono',_ui-monospace]">
                                            Unknown
                                          </span>
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
                                      variant="secondary"
                                      class="flex flex-row items-center gap-2 leading-none select-none"
                                      as={A}
                                      href={`/dashboard/rides/${ride.id}`}
                                    >
                                      <span class="font-bold">
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
                                          <span>
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
                    </Transition>
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
