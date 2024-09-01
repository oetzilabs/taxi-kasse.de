import { A, AnchorProps, useLocation, useResolvedPath } from "@solidjs/router";
import { cn } from "../lib/utils";

export default function NavLink(props: AnchorProps & { exact?: boolean }) {
  const location = useLocation();
  const rp = useResolvedPath(() => location.pathname);
  const isActive = () => props.exact ? rp() === props.href : rp()?.startsWith(props.href);
  return (
    <A
      {...props}
      // class={props.class ? props.class + " hover:bg-neutral-700" : "hover:bg-neutral-700"}
      class={cn(props.class, "xl:!flex w-full select-none", {
        hidden: !isActive(),
        "bg-neutral-200 dark:bg-neutral-700": isActive(),
      })}
      href={props.href}
    />
  );
}
