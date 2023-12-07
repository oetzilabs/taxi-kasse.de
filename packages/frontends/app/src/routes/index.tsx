import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { useAuth } from "../components/Auth";

export default function Home() {
  const [user] = useAuth();
  return <div class="flex w-full flex-col gap-4"></div>;
}
