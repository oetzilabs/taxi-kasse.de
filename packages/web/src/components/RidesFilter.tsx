import type { Rides } from "@taxikassede/core/src/entities/rides";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider, SliderFill, SliderLabel, SliderThumb, SliderTrack, SliderValueLabel } from "@/components/ui/slider";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { update } from "@solid-primitives/signal-builders";
import dayjs from "dayjs";
import Filter from "lucide-solid/icons/filter";
import { Accessor, createSignal, Setter } from "solid-js";
import Calendar from "./Calendar";

export type FilterValue = {
  dateRange?: { start?: Date; end?: Date };
  duration?: [number, number];
  distance?: [number, number];
  income?: [number, number];
  status?: Rides.Info["status"];
  rideType?: string;
};

type RideFiltersProps = {
  filterValue: Accessor<FilterValue>;
  onFilterChange: Setter<FilterValue>;
};

export const RideFilters = (props: RideFiltersProps) => {
  const [popoverOpen, setPopoverOpen] = createSignal(false);

  return (
    <Popover open={popoverOpen()} onOpenChange={setPopoverOpen} placement="bottom-end">
      <PopoverTrigger as={Button} size="sm" class="gap-2 h-8">
        <Filter class="size-4" />
        <span>Filters</span>
      </PopoverTrigger>
      <PopoverContent class="w-max-full min-w-auto w-auto text-sm flex flex-col gap-4">
        <PopoverTitle>Filters</PopoverTitle>
        <div class="flex flex-col gap-2 w-full">
          <Label>Date Range:</Label>
          <div class="flex flex-row items-center justify-between w-full gap-2">
            <Calendar
              onChange={(value) =>
                props.onFilterChange(
                  update(props.filterValue, "dateRange", (dateRange) => ({ ...dateRange, start: value })),
                )
              }
              value={props.filterValue().dateRange?.start ?? dayjs().toDate()}
            />
            <Calendar
              onChange={(value) =>
                props.onFilterChange(
                  update(props.filterValue, "dateRange", (dateRange) => ({ ...dateRange, end: value })),
                )
              }
              value={props.filterValue().dateRange?.start ?? dayjs().toDate()}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Duration:</Label>
          <Slider
            minValue={0}
            maxValue={120}
            value={props.filterValue().duration || [0, 120]}
            onChange={(value) =>
              props.onFilterChange(
                update(props.filterValue, "duration", (v) => [value[0], value[1]] as [number, number]),
              )
            }
            class="flex flex-col gap-4"
          >
            <div class="flex w-full justify-between ">
              <SliderLabel>Minutes</SliderLabel>
              <SliderValueLabel />
            </div>
            <div class="w-full px-2">
              <SliderTrack>
                <SliderFill />
                <SliderThumb />
              </SliderTrack>
            </div>
          </Slider>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Distance (km):</Label>
          <div class="flex gap-2">
            <TextFieldRoot
              value={String(props.filterValue().distance?.[0] || "")}
              onChange={(value) =>
                props.onFilterChange(
                  update(props.filterValue, "distance", (v) => [Number(value), v?.[1] || 0] as [number, number]),
                )
              }
            >
              <TextField type="number" placeholder="Min"></TextField>
            </TextFieldRoot>
            <TextFieldRoot
              value={String(props.filterValue().distance?.[1] || "")}
              onChange={(value) =>
                props.onFilterChange(
                  update(props.filterValue, "distance", (v) => [Number(value), v?.[0] || 0] as [number, number]),
                )
              }
            >
              <TextField type="number" placeholder="Max"></TextField>
            </TextFieldRoot>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Charge:</Label>
          <div class="flex gap-2">
            <TextFieldRoot
              value={String(props.filterValue().income?.[0] || "")}
              onChange={(value) =>
                props.onFilterChange(
                  update(props.filterValue, "income", (v) => [Number(value), v?.[1] || 0] as [number, number]),
                )
              }
            >
              <TextField type="number" placeholder="Min"></TextField>
            </TextFieldRoot>
            <TextFieldRoot
              value={String(props.filterValue().income?.[1] || "")}
              onChange={(value) =>
                props.onFilterChange(
                  update(props.filterValue, "income", (v) => [v?.[0] || 0, Number(value)] as [number, number]),
                )
              }
            >
              <TextField type="number" placeholder="Max"></TextField>
            </TextFieldRoot>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Status:</Label>
          <Select
            multiple={false}
            value={props.filterValue().status || "accepted"}
            onChange={(value) => {
              if (!value) return;
              props.onFilterChange(update(props.filterValue, "status", (v) => value));
            }}
            options={
              ["accepted", "pending", "rejected", "completed", "cancelled", "archived"] as Rides.Info["status"][]
            }
            placeholder="Select status"
            itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
          >
            <SelectTrigger>
              <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </div>
        <div class="flex flex-col gap-2">
          <Label>Ride Type:</Label>
          <Select
            multiple={false}
            value={props.filterValue().rideType || "all"}
            onChange={(value) => {
              if (!value) return;
              props.onFilterChange(update(props.filterValue, "rideType", (v) => value));
            }}
            options={["all", "single", "shared"]}
            placeholder="Select ride type"
            itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
          >
            <SelectTrigger>
              <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => props.onFilterChange({})}>
            Clear
          </Button>
          <Button size="sm" onClick={() => setPopoverOpen(false)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
