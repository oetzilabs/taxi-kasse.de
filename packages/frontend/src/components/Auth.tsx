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
    image: string;
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
  const signOut = () => {
    localStorage.removeItem("session");
    setAuthStore({
      isLoading: false,
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };
  return (
    <>
      <Show when={!AuthStore().isLoading} fallback={<div>Loading...</div>}>
        <Show when={AuthStore().isAuthenticated && AuthStore().user}>
          {(user) => (
            <div>
              <span class="text-sm text-gray-300">Welcome, {user().name}</span>
              <button onClick={signOut} class="ml-4 text-black py-1 px-2 rounded">
                Sign out
              </button>
            </div>
          )}
        </Show>
        <Show when={!AuthStore().isAuthenticated}>
          <A
            href={`${
              import.meta.env.VITE_AUTH_URL
            }/authorize?provider=google&response_type=token&client_id=google&redirect_uri=http://localhost:3000/`}
            rel="noreferrer"
            class="text-black py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Sign in with Google
          </A>
        </Show>
      </Show>
    </>
  );
};
