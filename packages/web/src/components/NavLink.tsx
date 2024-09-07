import { A, AnchorProps, useLocation, useResolvedPath } from "@solidjs/router";
import { cn } from "../lib/utils";

export default function NavLink(props: AnchorProps & { exact?: boolean }) {
  const location = useLocation();
  const rp = useResolvedPath(() => location.pathname);
  const isActive = () => (props.exact ? rp() === props.href : (rp()?.startsWith(props.href) ?? false));

  return (
    <A
      {...props}
      // class={props.class ? props.class + " hover:bg-neutral-700" : "hover:bg-neutral-700"}
      class={cn(props.class, "xl:!flex w-full select-none", {
        // hidden: !isActive(),
        "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100": isActive(),
      })}
      href={props.href}
    />
  );
}
