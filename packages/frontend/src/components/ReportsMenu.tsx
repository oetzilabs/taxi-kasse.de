import { DropdownMenu } from "@kobalte/core";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { For, Match, Switch, createSignal } from "solid-js";
import toast from "solid-toast";
import { Mutations } from "../utils/api/mutations";
import { cn } from "../utils/cn";
import { useAuth } from "./Auth";

type ReportsMenuProps = {};
export function ReportsMenu(props: ReportsMenuProps) {
  const [user] = useAuth();
  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950 active:bg-neutral-100 dark:active:bg-neutral-900 font-medium items-center justify-between";
  const [isVisible, setIsVisible] = createSignal(false);

  const reportsList = createQuery(
    () => ["reports"],
    () => {
      return [] as string[];
    },
    {
      get enabled() {
        return isVisible();
      },
      refetchOnMount: true,
    }
  );

  const createReport = createMutation(
    async (
      range:
        | {
            from: Date;
            to: Date;
          }
        | "month"
        | "year"
        | "all"
    ) => {
      let token = user().token;
      if (!token) {
        throw new Error("No token");
      }
      return Mutations.createReport(token, range);
    },
    {
      onSuccess: (report) => {
        toast.success("Report created");
      },
      onError: (err) => {
        toast.error("Report not created");
      },
    }
  );

  return (
    <DropdownMenu.Root placement="bottom-end" open={isVisible()} onOpenChange={setIsVisible}>
      <DropdownMenu.Trigger>
        <button
          class="p-2 py-1 flex items-center justify-center gap-2.5 hover:bg-neutral-50 rounded-md border border-black/10 dark:border-white/10 active:bg-neutral-100 dark:hover:bg-neutral-900 dark:active:bg-neutral-800"
          aria-label="reports menu"
        >
          <div class="w-4 h-4 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
              <path
                d="M9.66666 1.83334H3.99999C3.64637 1.83334 3.30723 1.97382 3.05718 2.22387C2.80713 2.47392 2.66666 2.81305 2.66666 3.16668V13.8333C2.66666 14.187 2.80713 14.5261 3.05718 14.7762C3.30723 15.0262 3.64637 15.1667 3.99999 15.1667H12C12.3536 15.1667 12.6928 15.0262 12.9428 14.7762C13.1928 14.5261 13.3333 14.187 13.3333 13.8333V5.50001L9.66666 1.83334Z"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9.33331 1.83334V5.83334H13.3333"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M10.6666 9.16666H5.33331" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10.6666 11.8333H5.33331" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6.66665 6.5H5.33331" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="select-none text-base font-bold">Reports</div>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="self-end mt-2 w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
          <Switch>
            {" "}
            <DropdownMenu.Group>
              <DropdownMenu.GroupLabel class="font-semibold p-2">Previous</DropdownMenu.GroupLabel>
              <Match when={reportsList.isLoading}>
                <DropdownMenu.Item class={cn(itemClass)} disabled>
                  <span>Loading...</span>
                </DropdownMenu.Item>
              </Match>
              <Match when={!reportsList.isLoading && (reportsList.data ?? []).length === 0}>
                <DropdownMenu.Item class={cn(itemClass)} disabled>
                  <span>No reports</span>
                </DropdownMenu.Item>
              </Match>
              <Match when={!reportsList.isLoading && (reportsList.data ?? []).length > 0 && (reportsList.data ?? [])}>
                {(reports) => (
                  <For each={reports()}>
                    {(report) => (
                      <DropdownMenu.Item
                        class={cn(itemClass)}
                        onSelect={() => {
                          toast.success("Coming soon");
                        }}
                      >
                        <span>{report}</span>
                      </DropdownMenu.Item>
                    )}
                  </For>
                )}
              </Match>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
          </Switch>
          <DropdownMenu.Item
            class={cn(itemClass)}
            closeOnSelect={false}
            onSelect={async () => {
              const dataBase64 = await createReport.mutateAsync("month");
              const blob = await fetch(dataBase64).then((r) => r.blob());
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "report.pdf";
              a.click();
            }}
          >
            <Switch>
              <Match when={createReport.isLoading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Creating Report
              </Match>
              <Match when={!createReport.isLoading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M3 15h6" />
                  <path d="M6 12v6" />
                </svg>
                Create Report
              </Match>
            </Switch>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
