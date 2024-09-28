import { A, AnchorProps, useLocation, useResolvedPath } from "@solidjs/router";
import { cn } from "../lib/utils";

export default function NavLink(props: AnchorProps & { exact?: boolean }) {
  const location = useLocation();
  const rp = useResolvedPath(() => location.pathname);
  const isActive = () => (props.exact ? rp() === props.href : (rp()?.startsWith(props.href) ?? false));

  return (
    <A
      class={cn(
        "flex flex-row items-center gap-3 pb-2 px-3 pt-6 text-sm w-max border-b-2 border-transparent select-none hover:border-neutral-300 dark:hover:border-neutral-800",
        {
          "border-neutral-800 dark:border-neutral-200 hover:border-neutral-800 dark:hover:border-neutral-200 font-bold":
            isActive(),
        },
      )}
      {...props}
      href={props.href}
    />
  );
}
