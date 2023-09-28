import { Show } from "solid-js";
import { useAuth } from "../components/Auth";

export default function Home() {
  const [user] = useAuth();
  return (
    <div class="flex container mx-auto flex-col">
      <Show when={user() && user()}>{(user) => <div class="flex flex-col w-full">{}</div>}</Show>
    </div>
  );
}
