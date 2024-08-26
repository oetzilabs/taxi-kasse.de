import { RouteDefinition, RouteSectionProps } from "@solidjs/router";
import Sidebar from "../../components/Sidebar";
import { getAuthenticatedSession } from "../../lib/auth/util";

export const route = {
  preload: (props) => {
    const session = getAuthenticatedSession();

    return { session };
  },
} satisfies RouteDefinition;

export default function DashboardLayout(props: RouteSectionProps) {
  return (
    <div class="flex flex-row gap-0 w-full grow">
      <Sidebar />
      <div class="flex flex-col gap-0 w-full grow">{props.children}</div>
    </div>
  );
}
