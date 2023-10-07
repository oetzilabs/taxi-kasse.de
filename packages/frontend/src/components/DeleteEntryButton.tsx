import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Mutations } from "../utils/api/mutations";
import toast from "solid-toast";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Button } from "./Button";
import { createEffect, createSignal } from "solid-js";
dayjs.extend(advancedFormat);

function FakeProgressBar(props: { time: number }) {
  const [progress, setProgress] = createSignal(0);
  createEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => p + 1);
    }, props.time / 100);
    return () => clearInterval(interval);
  });
  return (
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
      <div
        class="h-full bg-black dark:bg-white/50"
        style={{
          width: `${progress()}%`,
        }}
      ></div>
    </div>
  );
}

export const DeleteEntryButton = (props: { entryId: string; token: string }) => {
  const queryClient = useQueryClient();
  const [delteToastId, setDeleteToastID] = createSignal<string | null>(null);
  const deleteEntry = createMutation(
    (id: string) => {
      const payload = {
        id,
      } as Parameters<typeof Mutations.deleteDayEntry>[1];
      return Mutations.deleteDayEntry(props.token, payload);
    },
    {
      onSuccess: async (entry) => {
        if (entry.success) {
          toast.success(`Entry ${dayjs(entry.entry.date).format("Do MMM YYYY")} deleted`);
          let did = delteToastId();
          if (did) toast.dismiss(did);
          await queryClient.invalidateQueries(["calendar"]);
        }
      },
      onError: (err) => {
        let did = delteToastId();
        if (did) toast.dismiss(did);
        toast.error("Entry not deleted");
      },
    }
  );

  const confirmDelete = (id: string) => {
    let dId = toast.custom(
      <div class="relative overflow-clip flex flex-col border border-black/10 dark:border-white/10 rounded-md p-4 gap-4 shadow-sm">
        <span class="font-bold">Are you sure?</span>
        <div class="flex flex-row gap-2">
          <button
            class="p-1.5 px-2.5 bg-red-100 dark:bg-red-900 rounded-md border border-black/10 dark:border-white/10 justify-center items-center gap-2.5 flex cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 active:bg-red-300 dark:active:bg-red-700"
            onClick={async () => {
              await deleteEntry.mutateAsync(id);
            }}
          >
            <span>Yes, delete</span>
          </button>
          <button
            class="p-1.5 px-2.5 bg-white dark:bg-black rounded-md border border-black/10 dark:border-white/10 justify-center items-center gap-2.5 flex cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950 active:bg-neutral-100 dark:active:bg-neutral-900"
            onClick={async () => {
              toast.dismiss();
            }}
          >
            <span>No</span>
          </button>
        </div>
        <FakeProgressBar time={3000} />
      </div>,
      {
        duration: 3000,
        position: "bottom-right",
      }
    );
    setDeleteToastID(dId);
  };
  return (
    <Button.Icon
      danger
      onClick={() => {
        confirmDelete(props.entryId);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </Button.Icon>
  );
};
