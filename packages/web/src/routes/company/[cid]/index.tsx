import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RideSelect } from "@taxikassede/core/src/drizzle/sql/schemas/rides";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, ListIcon, SearchIcon } from "lucide-solid";
import { createMemo, createSignal, For, Match, Switch } from "solid-js";

const mockRides = Array.from({ length: 365 }, (_, i) => {
  const date = new Date(2023, 0, i + 1);
  return {
    id: `ride_${i}`,
    createdAt: date,
    income: (Math.random() * 200 + 50).toFixed(2),
    distance: (Math.random() * 100 + 20).toFixed(1),
    rating: (Math.random() * 2 + 3).toFixed(1),
    vehicle_id: "",
    user_id: "",
    org_id: "",
    updatedAt: null,
    deletedAt: null,
  } satisfies RideSelect;
});

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

export default function Component() {
  const [view, setView] = createSignal("list");
  const [page, setPage] = createSignal(1);
  const [search, setSearch] = createSignal("");
  const [currentDate, setCurrentDate] = createSignal(new Date());
  const itemsPerPage = 10;

  const filteredRides = createMemo(() =>
    mockRides.filter(
      (ride) =>
        ride.createdAt.toISOString().includes(search()) ||
        ride.income.includes(search()) ||
        ride.distance.includes(search()),
    ),
  );

  const totalPages = createMemo(() => Math.ceil(filteredRides().length / itemsPerPage));

  const paginatedRides = createMemo(() => filteredRides().slice((page() - 1) * itemsPerPage, page() * itemsPerPage));

  const calendarDays = createMemo(() => {
    const year = currentDate().getFullYear();
    const month = currentDate().getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split("T")[0];
      const dayRides = mockRides.filter((r) => r.createdAt.toISOString().startsWith(dateString));
      const totalIncome = dayRides.reduce((sum, ride) => sum + parseFloat(ride.income), 0).toFixed(2);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      days.push({ date: dateString, rides: dayRides.length, income: totalIncome, isWeekend });
    }

    return days;
  });

  const changeMonth = (increment: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Rides</h1>
        <ToggleGroup value={view()} onChange={(value) => setView(value)}>
          <ToggleGroupItem value="list" aria-label="List view">
            <ListIcon class="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" aria-label="Calendar view">
            <CalendarIcon class="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div class="mb-6">
        <TextFieldRoot value={search()} onChange={(value) => setSearch(value)}>
          <TextField
            placeholder="Search rides..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            class="max-w-sm"
          />
        </TextFieldRoot>
      </div>
      <Switch>
        <Match when={view() === "list"}>
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <For each={paginatedRides()}>
                  {(ride) => (
                    <TableRow>
                      <TableCell>{ride.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>${ride.income}</TableCell>
                      <TableCell>{ride.distance} km</TableCell>
                      <TableCell>{ride.rating}</TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
            <div class="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page() === 1}>
                Previous
              </Button>
              <span>
                Page {page()} of {totalPages()}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages(), p + 1))}
                disabled={page() === totalPages()}
              >
                Next
              </Button>
            </div>
          </>
        </Match>
        <Match when={view() === "calendar"}>
          <div class="grid grid-cols-7 gap-4">
            <div class="col-span-7 flex justify-between items-center mb-4">
              <Button variant="outline" onClick={() => changeMonth(-1)}>
                <ChevronLeftIcon class="h-4 w-4" />
              </Button>
              <h2 class="text-xl font-semibold">
                {currentDate().toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <Button variant="outline" onClick={() => changeMonth(1)}>
                <ChevronRightIcon class="h-4 w-4" />
              </Button>
            </div>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div class="text-center font-semibold">{day}</div>
            ))}
            <For each={calendarDays()}>
              {(day) => (
                <div class={`p-2 border rounded ${day?.isWeekend ? "bg-gray-100" : ""} ${day ? "" : "invisible"}`}>
                  {day && (
                    <>
                      <div class="text-right">{new Date(day.date).getDate()}</div>
                      <div class="text-sm">Rides: {day.rides}</div>
                      <div class="text-sm">Income: ${day.income}</div>
                    </>
                  )}
                </div>
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
