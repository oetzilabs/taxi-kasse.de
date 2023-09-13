import { A } from "@solidjs/router";
import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { useLocation } from "solid-start";

type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: {
    name: string;
    email: string;
  } | null;
};
const [AuthStore, setAuthStore] = createSignal<UseAuth>({
  isLoading: true,
  isAuthenticated: false,
  token: null,
  user: null,
});

export const Auth = () => {
  createEffect(async () => {
    const hash = useLocation().hash;
    // get #access_token from url
    const token = hash.split("&")[0].split("=")[1];
    if (token) {
      localStorage.setItem("session", token);
      window.location.replace(window.location.origin);
      const user = await fetch(`${import.meta.env.VITE_API_URL}/session`, {
        // credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());
      setAuthStore({
        isLoading: false,
        isAuthenticated: true,
        token,
        user,
      });
    } else {
      // check if session is in local storage
      const session = localStorage.getItem("session");
      if (session) {
        const user = await fetch(`${import.meta.env.VITE_API_URL}/session`, {
          // credentials: "include",
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }).then((res) => res.json());
        setAuthStore({
          isLoading: false,
          isAuthenticated: true,
          token: session,
          user,
        });
      } else {
        setAuthStore({
          isLoading: false,
          isAuthenticated: false,
          token: null,
          user: null,
        });
      }
    }
  });
  return (
    <>
      <Show when={!AuthStore().isLoading} fallback={<div>Loading...</div>}>
        <Show when={AuthStore().isAuthenticated && AuthStore().user}>
          {(user) => <span class="text-sm text-gray-300">Welcome, {user().name}</span>}
        </Show>
        <Show when={!AuthStore().isAuthenticated}>
          <div>
            <A
              href={`${
                import.meta.env.VITE_AUTH_URL
              }/authorize?provider=google&response_type=token&client_id=google&redirect_uri=http://localhost:3000/`}
              rel="noreferrer"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign in with Google
            </A>
          </div>
        </Show>
      </Show>
    </>
  );
};
