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
};

export function CreateEntryModal(props: CreateEntryModalProps) {
  const [modalOpen, setModalOpen] = createSignal(false);
  const queryClient = useQueryClient();
  const [entryData, setEntryData] = createSignal<Parameters<typeof Mutations.createDayEntry>[1]>({
    cash: 0,
    date: new Date(),
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
        props.onOpenChange && props.onOpenChange(false);
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
        <button
          type="button"
          disabled={createEntry.isLoading}
          class="w-full rounded-md bg-black text-white py-2"
          onClick={async () => {
            await createEntry.mutateAsync();
          }}
        >
          <Switch>
            <Match when={createEntry.isLoading}>Adding entry</Match>
            <Match when={!createEntry.isLoading}>Add entry</Match>
          </Switch>
        </button>
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
        <button
          type="button"
          disabled={updateEntry.isLoading}
          class="w-full rounded-md bg-black text-white py-2"
          onClick={async () => {
            await updateEntry.mutateAsync();
          }}
        >
          <Switch>
            <Match when={updateEntry.isLoading}>Saving entry</Match>
            <Match when={!updateEntry.isLoading}>Save entry</Match>
          </Switch>
        </button>
      </div>
    </Modal>
  );
}
