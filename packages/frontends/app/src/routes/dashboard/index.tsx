import { A } from "@solidjs/router";
import { Match, Show, Switch } from "solid-js";
import { useAuth } from "../../components/Auth";
import { UserDashboard } from "../../components/dashboards/user";

export default function Dashboard() {
  const [user] = useAuth();
  return <UserDashboard />;
}
