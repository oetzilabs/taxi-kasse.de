import { JSX, Match, Switch, createSignal } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import toast from "solid-toast";
import { Modal } from "./Modal";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

type CreateEntryModalProps = {
  token: string;
  children: JSX.Element;
  onOpenChange?: (open: boolean) => void;
  initialDate?: Date;
};

export function CreateEntryModal(props: CreateEntryModalProps) {
  const [modalOpen, setModalOpen] = createSignal(false);
  const queryClient = useQueryClient();
  const [entryData, setEntryData] = createSignal<Parameters<typeof Mutations.createDayEntry>[1]>({
    cash: 0,
    date: props.initialDate || new Date(),
    driven_distance: 0,
    total_distance: 0,
    tour_count: 0,
  });
  const createEntry = createMutation(
    () => {
      return Mutations.createDayEntry(props.token, entryData());
    },
    {
      onSuccess: (entry) => {
        queryClient.invalidateQueries(["calendar"]);
        toast.success("Entry created");
        setModalOpen(false);
        props.onOpenChange && props.onOpenChange(false);
      },
      onError: (err) => {
        toast.error("Entry not created");
        setModalOpen(false);
        props.onOpenChange && props.onOpenChange(false);
      },
    }
  );
  return (
    <Modal
      title="New Entry"
      open={modalOpen()}
      onOpenChange={(x) => {
        setModalOpen(x);
        props.onOpenChange && props.onOpenChange(x);
      }}
      trigger={props.children}
    >
      <div class="flex flex-col gap-2">
        <label class="flex flex-col gap-1">
          <span>Date</span>
          <input
            type="date"
            name="date"
            value={dayjs(entryData().date).format("YYYY-MM-DD")}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, date: dayjs(e.currentTarget.value).toDate() }));
            }}
            disabled={createEntry.isLoading}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>Total Distance</span>
          <input
            type="number"
            name="distance"
            min="0"
            step="0.01"
            value={entryData().total_distance}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, total_distance: parseFloat(e.currentTarget.value) }));
            }}
            disabled={createEntry.isLoading}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>Driven distance</span>
          <input
            type="number"
            name="driven_distance"
            min="0"
            step="0.01"
            value={entryData().driven_distance}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, driven_distance: parseFloat(e.currentTarget.value) }));
            }}
            disabled={createEntry.isLoading}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>Price</span>
          <input
            type="number"
            name="cash"
            min="0"
            step="0.01"
            disabled={createEntry.isLoading}
            value={entryData().cash}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, cash: parseFloat(e.currentTarget.value) }));
            }}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <div class="flex flex-row justify-end w-full">
          <button
            type="button"
            disabled={createEntry.isLoading}
            class="flex items-center justify-center p-2 py-1 bg-black rounded-md border-black/10 text-white dark:bg-white dark:border-white/10 dark:text-black gap-2"
            onClick={async () => {
              await createEntry.mutateAsync();
            }}
          >
            <Switch>
              <Match when={createEntry.isLoading}>
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
                <span>Adding entry</span>
              </Match>
              <Match when={!createEntry.isLoading}>
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
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span>Add entry</span>
              </Match>
            </Switch>
          </button>
        </div>
      </div>
    </Modal>
  );
}

type EditEntryModalProps = {
  token: string;
  date: Date;
  entry: Parameters<typeof Mutations.updateDayEntry>[1];
  children: JSX.Element;
  onOpenChange?: (open: boolean) => void;
};

export function EditEntryModal(props: EditEntryModalProps) {
  const [modalOpen, setModalOpen] = createSignal(false);
  const queryClient = useQueryClient();
  const [entryData, setEntryData] = createSignal<Parameters<typeof Mutations.updateDayEntry>[1]>(props.entry);

  const updateEntry = createMutation(
    () => {
      return Mutations.updateDayEntry(props.token, entryData());
    },
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(`Updated ${dayjs(data.entry.date).format("Do MMM")}`);
          queryClient.invalidateQueries(["calendar"]);
        } else {
          toast.error(`Entry not updated`);
        }
        setModalOpen(false);
      },
      onError: (err) => {
        toast.error(`Entry not updated`);
        setModalOpen(false);
      },
    }
  );
  return (
    <Modal
      title="Edit Entry"
      open={modalOpen()}
      onOpenChange={(x) => {
        setModalOpen(x);
        props.onOpenChange && props.onOpenChange(x);
      }}
      trigger={props.children}
    >
      <div class="flex flex-col gap-2">
        <label class="flex flex-col gap-1">
          <span>Date</span>
          <input
            type="date"
            name="date"
            value={dayjs(props.date).format("YYYY-MM-DD")}
            disabled
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>Total Distance</span>
          <input
            type="number"
            name="distance"
            min="0"
            step="0.01"
            value={entryData().total_distance}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, total_distance: parseFloat(e.currentTarget.value) }));
            }}
            disabled={updateEntry.isLoading}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>Driven distance</span>
          <input
            type="number"
            name="driven_distance"
            min="0"
            step="0.01"
            value={entryData().driven_distance}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, driven_distance: parseFloat(e.currentTarget.value) }));
            }}
            disabled={updateEntry.isLoading}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>Price</span>
          <input
            type="number"
            name="cash"
            min="0"
            step="0.01"
            disabled={updateEntry.isLoading}
            value={entryData().cash}
            onInput={(e) => {
              setEntryData((d) => ({ ...d, cash: parseFloat(e.currentTarget.value) }));
            }}
            class="w-full rounded-md bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
          />
        </label>
        <div class="flex flex-row justify-end w-full">
          <button
            type="button"
            disabled={updateEntry.isLoading}
            class="flex items-center justify-center p-2 py-1 bg-black rounded-md border-black/10 text-white dark:bg-white dark:border-white/10 dark:text-black gap-2"
            onClick={async () => {
              await updateEntry.mutateAsync();
            }}
          >
            <Switch>
              <Match when={updateEntry.isLoading}>
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
                <span>Saving entry</span>
              </Match>
              <Match when={!updateEntry.isLoading}>
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save entry</span>
              </Match>
            </Switch>
          </button>
        </div>
      </div>
    </Modal>
  );
}
