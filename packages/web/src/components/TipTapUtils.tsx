import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { ToggleButton } from "@/components/ui/toggle";
import {
  Editor,
  Extensions,
  getSchema,
  getTextSerializersFromSchema,
  JSONContent,
  Range,
  TextSerializer,
} from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import Bold from "lucide-solid/icons/bold";
import Code from "lucide-solid/icons/code";
import Code2 from "lucide-solid/icons/code-2";
import Heading1 from "lucide-solid/icons/heading-1";
import Heading2 from "lucide-solid/icons/heading-2";
import ImagePlusIcon from "lucide-solid/icons/image-plus";
import Italic from "lucide-solid/icons/italic";
import LinkIcon from "lucide-solid/icons/link";
import List from "lucide-solid/icons/list";
import ListOrdered from "lucide-solid/icons/list-ordered";
import Loader2 from "lucide-solid/icons/loader-2";
import Quote from "lucide-solid/icons/quote";
import Strikethrough from "lucide-solid/icons/strikethrough";
import Type from "lucide-solid/icons/type";
import WrapText from "lucide-solid/icons/wrap-text";
import X from "lucide-solid/icons/x";
import { createSignal, For, JSX, Show } from "solid-js";
import { toast } from "solid-sonner";
import { createEditorTransaction } from "solid-tiptap";

export function Separator() {
  return (
    <div class="flex items-center" aria-hidden="true">
      <div class="h-full border-l border-neutral-200 dark:border-neutral-800" />
    </div>
  );
}

export interface ControlProps {
  class: string;
  editor: Editor;
  title: string;
  key: string;
  onChange: () => void;
  isActive?: (editor: Editor) => boolean;
  children: JSX.Element;
}

export function Control(props: ControlProps): JSX.Element {
  const flag = createEditorTransaction(
    () => props.editor,
    (instance) => {
      if (props.isActive) {
        return props.isActive(instance);
      }
      return instance.isActive(props.key);
    },
  );

  return (
    <ToggleButton
      size="sm"
      pressed={flag()}
      class={`${props.class} size-8 flex items-center justify-center rounded focus:outline-none focus-visible:ring focus-visible:ring-purple-400 focus-visible:ring-opacity-75 !p-2`}
      title={props.title}
      onChange={props.onChange}
    >
      {props.children}
    </ToggleButton>
  );
}

export interface ToolbarProps {
  editor: Editor;
}

export function ToolbarContents(props: ToolbarProps): JSX.Element {
  const [imageAddOpen, setImageAddOpen] = createSignal(false);
  const [images, setImages] = createSignal<File[]>([]);
  const imageAdded = (e: Event) => {
    const files = (e.target as HTMLInputElement).files ?? [];
    const fs = Array.from(files);

    setImages(() => [...images(), ...fs]);
  };
  const [isUploadingImages, setIsUploadingImages] = createSignal(false);
  const uploadImages = async () => {
    setIsUploadingImages(true);

    // transform the files to base64 strings
    const base64Images = await Promise.all(
      images().map(
        (image) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(image);
          }),
      ),
    );

    setIsUploadingImages(false);
    return base64Images;
  };
  let imageUploader: HTMLInputElement;

  const [fileAttachmentAddOpen, setFileAttachmentAddOpen] = createSignal(false);
  const [fileAttachments, setFileAttachments] = createSignal<File[]>([]);
  const fileAttachmentAdded = (e: Event) => {
    const files = (e.target as HTMLInputElement).files ?? [];
    const fs = Array.from(files);

    setFileAttachments(() => [...fileAttachments(), ...fs]);
  };
  const [isUploadingFileAttachments, setIsUploadingFileAttachments] = createSignal(false);
  const uploadFileAttachments = async () => {
    setIsUploadingFileAttachments(true);
    const formData = new FormData();
    for (const file of fileAttachments()) {
      formData.append("fileAttachments", file);
    }
    // const res = await fetch(new URL("/blogs/upload/fileAttachments", import.meta.env.VITE_API_URL), {
    //   method: "POST",
    //   body: formData,
    // });
    setIsUploadingFileAttachments(false);
    return [
      {
        url: "/testtest",
        name: "testtest",
        size: 1024,
      },
      {
        url: "/lol",
        name: "lol",
        size: 123123,
      },
    ];
    // return res.json();
  };
  let fileAttachmentUploader: HTMLInputElement;

  // files types that can be opened in the office/company pc
  const allowedFileTypes = ["application/pdf"];

  const [linkAddOpen, setLinkAddOpen] = createSignal(false);
  const [urlData, setUrlData] = createSignal("");

  return (
    <div class="p-2 flex space-x-1">
      <div class="flex space-x-1">
        <Control
          key="paragraph"
          class="font-bold"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().setParagraph().run()}
          title="Paragraph"
        >
          <Type />
        </Control>
        <Control
          key="heading-1"
          class="font-bold"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().setHeading({ level: 1 }).run()}
          isActive={(editor) => editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 />
        </Control>
        <Control
          key="heading-2"
          class="font-bold"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().setHeading({ level: 2 }).run()}
          isActive={(editor) => editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 />
        </Control>
      </div>
      <Separator />
      <div class="flex space-x-1">
        <Control
          key="bold"
          class="font-bold"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold />
        </Control>
        <Control
          key="italic"
          class="italic"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic />
        </Control>
        <Control
          key="strike"
          class="line-through"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleStrike().run()}
          title="Strike Through"
        >
          <Strikethrough />
        </Control>
        <Control
          key="code"
          class=""
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleCode().run()}
          title="Code"
        >
          <Code />
        </Control>
      </div>
      <Separator />
      <div class="flex space-x-1">
        <Control
          key="break"
          class="font-bold"
          editor={props.editor}
          onChange={() => props.editor.chain().focus().setHardBreak().run()}
          title="Break"
        >
          <WrapText />
        </Control>
        <Control
          key="bulletList"
          class=""
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List />
        </Control>
        <Control
          key="orderedList"
          class=""
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered />
        </Control>
        <Control
          key="blockquote"
          class=""
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote />
        </Control>
        <Control
          key="codeBlock"
          class=""
          editor={props.editor}
          onChange={() => props.editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code2 />
        </Control>
      </div>
      <Separator />
      <div class="flex space-x-1">
        <input class="hidden" type="file" accept="image/*" multiple onChange={imageAdded} ref={imageUploader!} />
        <input
          class="hidden"
          type="file"
          accept={allowedFileTypes.join(",")}
          multiple
          onChange={fileAttachmentAdded}
          ref={fileAttachmentUploader!}
        />
        <AlertDialog open={imageAddOpen()} onOpenChange={setImageAddOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Upload Images</AlertDialogTitle>
              <AlertDialogDescription>
                Please choose the images you want to upload. You can upload up to 10 images at a time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div class="flex flex-col gap-2 w-full">
              <For
                each={images()}
                fallback={
                  <div
                    class="flex flex-col gap-2 w-full items-center justify-center py-8 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer"
                    onClick={() => {
                      imageUploader!.click();
                    }}
                  >
                    <span class="text-muted-foreground text-sm">Click here to choose images</span>
                  </div>
                }
              >
                {(image) => (
                  <div class="flex flex-row gap-2 w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg items-center justify-between">
                    <div class="w-full flex flex-row items-center justify-start gap-2">
                      <img
                        src={URL.createObjectURL(image)}
                        class="size-12 object-cover rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
                      />
                      <span class="text-sm">{image.name}</span>
                    </div>
                    <div class="w-max flex flex-row items-center justify-end gap-2 shrink-0">
                      <span class="text-xs w-max flex items-center justify-center shrink-0">
                        {(image.size / 1024).toFixed(2)} KB
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        class="flex items-center justify-center size-6"
                        onClick={() => {
                          setImages(() => images().filter((i) => i !== image));
                        }}
                      >
                        <X class="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </For>
              <Show when={images().length > 0}>
                <div class="flex flex-row gap-2 w-full items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    class="flex flex-row gap-2 w-full items-center justify-center"
                    onClick={() => {
                      setImages(() => []);
                      imageUploader!.value = "";
                    }}
                  >
                    <X class="size-4" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    class="flex flex-row gap-2 w-full items-center justify-center"
                    onClick={() => {
                      imageUploader!.click();
                    }}
                  >
                    <ImagePlusIcon class="size-4" />
                    Add More
                  </Button>
                </div>
              </Show>
            </div>
            <AlertDialogFooter>
              <AlertDialogClose
                size="sm"
                onClick={() => {
                  setImages(() => []);
                  imageUploader!.value = "";
                }}
              >
                Cancel
              </AlertDialogClose>
              <AlertDialogAction
                size="sm"
                disabled={isUploadingImages()}
                onClick={async () => {
                  toast.promise(uploadImages(), {
                    loading: "Uploading Images",
                    success: (data) => {
                      const f = props.editor.chain().focus();
                      for (const imageUrl of data) {
                        f.setImage({ src: imageUrl });
                      }
                      f.run();
                      return "Images Uploaded";
                    },
                    error: "Failed to Upload Images",
                  });
                }}
              >
                <Show when={!isUploadingImages()} fallback={<Loader2 class="size-4 animate-spin" />}>
                  Upload
                </Show>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Control
          key="image"
          class=""
          editor={props.editor}
          onChange={() => {
            setImageAddOpen(() => !imageAddOpen());
            imageUploader!.click();
          }}
          title="Add Image"
        >
          <ImagePlusIcon />
        </Control>
        {/* <AlertDialog open={fileAttachmentAddOpen()} onOpenChange={setFileAttachmentAddOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Upload Files</AlertDialogTitle>
              <AlertDialogDescription>
                Please choose the files you want to upload. You can upload up to 10 files at a time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div class="flex flex-col gap-2 w-full">
              <For
                each={fileAttachments()}
                fallback={
                  <div
                    class="flex flex-col gap-2 w-full items-center justify-center py-8 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer"
                    onClick={() => {
                      fileAttachmentUploader!.click();
                    }}
                  >
                    <span class="text-muted-foreground text-sm">Click here to choose a file</span>
                  </div>
                }
              >
                {(file) => (
                  <div class="flex flex-row gap-2 w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg items-center justify-between">
                    <div class="w-full flex flex-row items-center justify-start gap-2">
                      <img
                        src={URL.createObjectURL(file)}
                        class="size-12 object-cover rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
                      />
                      <span class="text-sm">{file.name}</span>
                    </div>
                    <span class="text-xs w-max flex-1 flex">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                )}
              </For>
              <Show when={fileAttachments().length > 0}>
                <div class="flex flex-row gap-2 w-full items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    class="flex flex-row gap-2 w-full items-center justify-center"
                    onClick={() => {
                      setFileAttachments(() => []);
                      fileAttachmentUploader!.value = "";
                    }}
                  >
                    <X class="size-4" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    class="flex flex-row gap-2 w-full items-center justify-center"
                    onClick={() => {
                      fileAttachmentUploader!.click();
                    }}
                  >
                    <FilePlusIcon class="size-4" />
                    Add More
                  </Button>
                </div>
              </Show>
            </div>
            <AlertDialogFooter>
              <AlertDialogClose
                size="sm"
                onClick={() => {
                  setFileAttachments(() => []);
                  fileAttachmentUploader!.value = "";
                }}
              >
                Cancel
              </AlertDialogClose>
              <AlertDialogAction
                size="sm"
                disabled={isUploadingFileAttachments()}
                onClick={async () => {
                  toast.promise(uploadFileAttachments(), {
                    loading: "Uploading File Attachments",
                    success: (data) => {
                      let f = props.editor.chain().focus();
                      for (const file of data) {
                        f = f.setFileAttachment({ src: file.url, name: file.name, size: file.size });
                      }
                      f.run();
                      setFileAttachments(() => []);
                      setIsUploadingFileAttachments(false);
                      return "File Attachments Uploaded";
                    },
                    error: (e) => {
                      console.log(e);
                      return "Failed to Upload File Attachments: " + e.message;
                    },
                  });
                }}
              >
                <Show when={!isUploadingFileAttachments()} fallback={<Loader2 class="size-4 animate-spin" />}>
                  <FilePlus2Icon class="size-4" />
                </Show>
                Upload
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Control
          key="file-attachment"
          class=""
          editor={props.editor}
          onChange={() => {
            setFileAttachmentAddOpen(() => !fileAttachmentAddOpen());
            fileAttachmentUploader!.click();
          }}
          title="Add File Attachment"
        >
          <FilePlus2Icon />
        </Control> */}
        <AlertDialog open={linkAddOpen()} onOpenChange={setLinkAddOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Link</AlertDialogTitle>
              <AlertDialogDescription>Please enter the URL of the link you want to add.</AlertDialogDescription>
            </AlertDialogHeader>
            <div class="flex flex-col gap-2 w-full">
              <TextFieldRoot value={urlData()} onChange={setUrlData}>
                <TextField placeholder="URL"></TextField>
              </TextFieldRoot>
            </div>
            <AlertDialogFooter>
              <AlertDialogClose
                size="sm"
                onClick={() => {
                  setLinkAddOpen(() => false);
                }}
              >
                Cancel
              </AlertDialogClose>
              <AlertDialogAction
                size="sm"
                onClick={async () => {
                  props.editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: urlData(), target: "_blank" })
                    .run();
                }}
              >
                Add
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Control
          key="link"
          class=""
          editor={props.editor}
          onChange={() => {
            const isLink = props.editor.getAttributes("link");
            if (isLink.href) {
              // remove link
              props.editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            setLinkAddOpen(() => !linkAddOpen());
          }}
          title="Add Link"
        >
          <LinkIcon />
        </Control>
      </div>
    </div>
  );
}

export function getTextBetween(
  node: ProseMirrorNode,
  range: Range,
  options?: {
    blockSeparator?: string;
    textSerializers?: Record<string, TextSerializer>;
  },
): string {
  // 【ADD】 return if empty
  if (!node.textContent) {
    return "";
  }

  const { from, to } = range;
  const { blockSeparator = "\n\n", textSerializers = {} } = options || {};
  let text = "";
  let separated = true;

  node.nodesBetween(from, to, (node, pos, parent, index) => {
    const textSerializer = textSerializers?.[node.type.name];

    // 【ADD】 empty paragraph retrun as blockSeparator
    if (node.type.name === "paragraph" && node.childCount === 0) {
      text += blockSeparator;
    } else if (textSerializer) {
      if (node.isBlock && !separated) {
        text += blockSeparator;
        separated = true;
      }

      if (parent) {
        text += textSerializer({
          node,
          pos,
          parent,
          index,
          range,
        });
      }
    } else if (node.isText) {
      text += node?.text?.slice(Math.max(from, pos) - pos, to - pos); // eslint-disable-line
      separated = false;
    } else if (node.isBlock && !separated) {
      text += blockSeparator;
      separated = true;
    }
  });

  return text;
}

export function getText(
  node: ProseMirrorNode,
  options?: {
    blockSeparator?: string;
    textSerializers?: Record<string, TextSerializer>;
  },
) {
  const range = {
    from: 0,
    to: node.content.size,
  };

  return getTextBetween(node, range, options);
}

export function generateText(
  doc: JSONContent,
  extensions: Extensions,
  options?: {
    blockSeparator?: string;
    textSerializers?: Record<string, TextSerializer>;
  },
): string {
  const { blockSeparator = "\n", textSerializers = {} } = options || {};
  const schema = getSchema(extensions);
  const contentNode = ProseMirrorNode.fromJSON(schema, doc);

  return getText(contentNode, {
    blockSeparator,
    textSerializers: {
      ...getTextSerializersFromSchema(schema),
      ...textSerializers,
    },
  });
}
