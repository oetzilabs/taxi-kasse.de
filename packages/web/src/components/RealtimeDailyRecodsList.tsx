import type { Calendar } from "@taxikassede/core/src/entities/calendar";
import { concat, filter } from "@solid-primitives/signal-builders";
import { UserSession } from "~/lib/auth/util";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Accessor, createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { CalendarView } from "./CalendarView";
import { useRealtime } from "./Realtime";

dayjs.extend(isBetween);

type RealtimeDailyRecordsListProps = {
  daily_records_list: Accessor<Calendar.Info[]>;
  session: Accessor<UserSession>;
};

export const RealtimeDailyRecordsList = (props: RealtimeDailyRecordsListProps) => {
  const [daily_records, set_daily_records] = createSignal(props.daily_records_list());
  const rt = useRealtime();

  createEffect(() => {
    const rs = props.daily_records_list();
    set_daily_records(rs);
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
      const unsubRideCreated = rt.subscribe("daily_record.created", (payload) => {
        // console.log("received system notification", payload);
        // does the daily_record already exist?
        const filtered = filter(daily_records, (r) => r.id === payload.id);
        if (filtered().length > 0) {
          return;
        }
        const concatted = concat(daily_records, payload);
        set_daily_records(concatted());
      });

      const unsubRideDeleted = rt.subscribe("daily_record.deleted", (payload) => {
        // console.log("received system notification", payload);
        const filtered = filter(daily_records, (r) => r.id !== payload.id);
        set_daily_records(filtered());
      });

      onCleanup(() => {
        unsubRideCreated();
        unsubRideDeleted();
      });
    }
  });

  return (
    <div class="gap-0 w-full grow">
      <div class="flex flex-col gap-0 w-full grow">
        <Show when={daily_records()}>
          {(_records) => (
            <div class="h-max w-full flex flex-col">
              <CalendarView records={_records()} month={new Date()} />
            </div>
          )}
        </Show>
      </div>
    </div>
  );
};
