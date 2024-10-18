import { A, AnchorProps, useLocation, useResolvedPath } from "@solidjs/router";
import { cn } from "../lib/utils";

export default function NavLink(props: AnchorProps & { exact?: boolean }) {
  const location = useLocation();
  const rp = useResolvedPath(() => location.pathname);
  const isActive = () => (props.exact ? rp() === props.href : (rp()?.startsWith(props.href) ?? false));

  return (
    <A
      class={cn("flex flex-col items-center gap-2 py-2 text-sm w-max select-none leading-none group")}
      {...props}
      href={props.href}
    >
      <div class={cn("flex flex-row items-center gap-2 px-1", { "font-bold": isActive() })}>{props.children}</div>
      <div
        class={cn("size-1 lg:w-full group-hover:bg-neutral-300 dark:group-hover:bg-neutral-700 rounded-full", {
          "bg-neutral-800 dark:bg-neutral-200 group-hover:bg-neutral-800 dark:group-hover:bg-neutral-200": isActive(),
        })}
      />
    </A>
  );
}
