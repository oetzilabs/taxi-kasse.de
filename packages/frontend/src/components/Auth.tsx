import { A } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";

type UseAuth =
  | {
      isLoading: true;
    }
  | {
      isLoading: false;
      isAuthenticated: false;
    }
  | {
      isLoading: false;
      isAuthenticated: true;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
const [AuthStore, setAuthStore] = createStore<UseAuth>({
  isLoading: false,
  isAuthenticated: false,
});

export const Auth = () => {
  return (
    <>
      <Show when={!AuthStore.isLoading && AuthStore.isAuthenticated && AuthStore.user}>
        {(user) => <span class="text-sm text-gray-300">Welcome, {user().id}</span>}
      </Show>
      <Show when={!AuthStore.isLoading && !AuthStore.isAuthenticated}>
        <div>
          <A href="" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {}}>
            Sign in with Google
          </A>
        </div>
      </Show>
    </>
  );
};
