import { A, AnchorProps, useLocation } from "@solidjs/router";
import { cn } from "../lib/utils";

export default function NavLink(props: AnchorProps) {
  const location = useLocation();
  const isActive = () => location.pathname === props.href;
  return (
    <A
      {...props}
      // class={props.class ? props.class + " hover:bg-neutral-700" : "hover:bg-neutral-700"}
      class={cn(props.class, "xl:!flex w-full", {
        hidden: !isActive(),
      })}
      href={props.href}
    />
  );
}
