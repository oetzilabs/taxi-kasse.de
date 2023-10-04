import { JSX, Match, Switch } from "solid-js";
import { cn } from "../utils/cn";

export * as Button from "./Button";

interface PrimaryProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
  ghost?: boolean;
}

function TheButton(props: PrimaryProps) {
  const { class: class_, ...restProps } = props;
  return (
    <button
      class={cn(
        "p-1 px-2.5 flex gap-2 items-center justify-center select-none font-bold rounded-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        class_
      )}
      {...restProps}
    >
      {props.children}
    </button>
  );
}

export function Primary(props: PrimaryProps) {
  const { class: _class, ...restProps } = props;
  return (
    <TheButton
      class={cn(
        "bg-black rounded-md border-black/10 text-white",
        "dark:bg-white dark:border-white/10 dark:text-black",
        {
          "bg-red-500 hover:bg-red-600 active:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700":
            props.danger,
        },
        _class
      )}
      {...restProps}
    />
  );
}

export function Secondary(props: PrimaryProps) {
  const { class: _class, ...restProps } = props;
  return (
    <TheButton
      class={cn(
        "hover:bg-neutral-50 rounded-md border border-black/10 dark:border-white/10 active:bg-neutral-100",
        "dark:hover:bg-neutral-900 dark:active:bg-neutral-800",
        {
          "bg-red-500 hover:bg-red-600 active:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700":
            props.danger,
        },
        _class
      )}
      {...restProps}
    />
  );
}

export function Ghost(props: PrimaryProps) {
  const { class: _class, ...restProps } = props;
  return (
    <TheButton
      class={cn(
        "hover:bg-neutral-100 rounded-md border-none active:bg-neutral-200",
        "dark:hover:bg-neutral-900 dark:active:bg-neutral-800",
        {
          "hover:bg-red-600/20 active:text-white active:bg-red-600/50 dark:hover:bg-red-600/50 dark:active:bg-red-500/70 dark:text-red-100 text-red-500":
            props.danger,
        },
        _class
      )}
      {...restProps}
    />
  );
}

export function Icon(props: PrimaryProps) {
  const { class: _class, ...restProps } = props;
  return (
    <Switch
      fallback={
        <TheButton
          class={cn("p-2 rounded-md hover:bg-neutral-100 hover:dark:bg-neutral-800", {
            "bg-red-500 dark:bg-red-500": props.danger && typeof props.ghost === "undefined",
            "bg-transparent": props.ghost,
          })}
          {...restProps}
        />
      }
    >
      <Match when={props.ghost}>
        <Ghost class="p-2" {...restProps} />
      </Match>
    </Switch>
  );
}
