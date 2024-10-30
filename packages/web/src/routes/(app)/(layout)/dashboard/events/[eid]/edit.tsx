import type { Events } from "@taxikassede/core/src/entities/events";
import type { InferInput } from "valibot";
import Calendar from "@/components/Calendar";
import { useRealtime } from "@/components/Realtime";
import { generateText, Separator, ToolbarContents } from "@/components/TipTapUtils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getLanguage } from "@/lib/api/application";
import { getEvent, updateEvent } from "@/lib/api/events";
import { getAllRegions } from "@/lib/api/regions";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, RouteDefinition, RouteSectionProps, useAction, useSubmission } from "@solidjs/router";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import dayjs from "dayjs";
import { Accessor, ErrorBoundary, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { createTiptapEditor, EditorRef } from "solid-tiptap";
import { Toolbar } from "terracotta";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const language = await getLanguage();
    const regions = await getAllRegions();
    const event = await getEvent(props.params.eid);
    return { session, language, regions, event };
  },
} satisfies RouteDefinition;

type EditorFormProps = {
  form: Accessor<Events.Info>;
};

const EditForm = (props: EditorFormProps) => {
  const rt = useRealtime();
  const regions = createAsync(() => getAllRegions());
  const [form, setForm] = createStore<InferInput<typeof Events.UpdateSchema>>(props.form());

  const updateEventAction = useAction(updateEvent);
  const updateEventSubmission = useSubmission(updateEvent);

  let ref: HTMLDivElement;

  let menu: HTMLDivElement;

  const extensions = [
    StarterKit,
    BubbleMenu.configure({
      element: menu!,
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class:
          "w-full h-full object-cover rounded-lg bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800",
      },
    }),
    Link.configure({
      HTMLAttributes: {
        class: "font-bold text-blue-500 hover:underline",
      },
      autolink: false,
      openOnClick: false,
    }),
  ];

  const editor = createTiptapEditor(() => ({
    element: ref!,
    onUpdate: (props) => {
      const first_header = props.editor.$nodes("heading")?.[0];

      setForm("contentHTML", props.editor.getHTML());
      setForm("contentText", generateText(props.editor.getJSON(), extensions));
    },
    extensions,
    autofocus: false,
    content: props.form().contentHTML ?? "",
    editorProps: {
      attributes: {
        class: "p-4 focus:outline-none !w-full max-w-full bg-background !h-full !max-h-full ",
        spellcheck: "false",
      },
    },
  }));

  return (
    <div class="flex flex-col gap-4 w-full">
      <h1 class="text-2xl font-bold mb-4">Edit Event</h1>
      <div class="flex flex-col gap-4 w-full">
        <TextFieldRoot onChange={(value) => setForm("name", value)} value={form.name}>
          <TextFieldLabel>Event Name</TextFieldLabel>
          <TextField required autofocus />
        </TextFieldRoot>
        <TextFieldRoot onChange={(value) => setForm("description", value)} value={form.description}>
          <TextFieldLabel>Event Description</TextFieldLabel>
          <TextField required />
        </TextFieldRoot>
        <Calendar onChange={(v) => setForm("date", dayjs(v).format("YYYY-MM-DD"))} value={dayjs(form.date).toDate()} />

        <div class="border border-neutral-200 dark:border-neutral-800 max-w-full w-full h-full min-h-[300px] max-h-[calc(100vh-400px)] rounded-lg flex flex-col flex-1 overflow-clip overflow-y-auto relative">
          <Toolbar
            ref={menu!}
            class="sticky top-0 bg-background border-b border-neutral-200 dark:border-neutral-800 z-20 h-[48px]"
            horizontal
          >
            <Show
              when={editor()}
              keyed
              fallback={
                <div class="flex flex-row gap-1 items-center h-full w-max p-2">
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Separator />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Separator />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                  <Separator />
                  <Skeleton class="size-8" />
                  <Skeleton class="size-8" />
                </div>
              }
            >
              {(instance) => <ToolbarContents editor={instance} />}
            </Show>
          </Toolbar>
          <div
            class="flex flex-col w-full h-full prose dark:prose-invert prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-sm dark:prose-p:text-white prose-p:m-1 prose-p:leading-1 prose-neutral prose-li:marker:text-black dark:prose-li:marker:text-white prose-li:marker:font-medium"
            ref={ref!}
          />
        </div>
        {/* <Suspense
          fallback={
            <div class="w-full h-9 bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-900 rounded-xl" />
          }
        >
          <Show when={regions() && regions()}>
            {(regs) => (
              <Select
                options={regs()}
                itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue.name}</SelectItem>}
                onChange={(value) => {
                  if (!value) return;
                  setForm("region_id", value.id);
                }}
              >
                <SelectTrigger>
                  <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            )}
          </Show>
        </Suspense> */}
        <div class="flex flex-row items-center gap-4 justify-end">
          <Button
            disabled={!form.name || !form.description || !form.date || updateEventSubmission.pending}
            size="sm"
            onClick={() => {
              toast.promise(updateEventAction(form), {
                loading: "Updating Event",
                success: "Event Updated",
                error: "Failed to Update Event",
              });
            }}
          >
            Save Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function EditEvent(props: RouteSectionProps) {
  const event = createAsync(() => getEvent(props.params.eid));
  return <Show when={event() && event()}>{(e) => <EditForm form={e} />}</Show>;
}
