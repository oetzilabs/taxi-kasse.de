import { RouteSectionProps } from "@solidjs/router";

export default function DashboardLayout(props: RouteSectionProps) {
  return (
    <div class="flex flex-col gap-0 w-full grow">
      <div class="flex flex-col gap-0 w-full grow">{props.children}</div>
    </div>
  );
}
