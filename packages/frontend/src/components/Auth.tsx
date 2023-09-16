import { A } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import { parseCookie } from "solid-start";
import { User } from "../../../core/src/entities/users";

type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User.Frontend | null;
};

const [AuthStore, setAuthStore] = createSignal<UseAuth>({
  isLoading: true,
  isAuthenticated: false,
  token: null,
  user: null,
});

export const Auth = () => {
  createEffect(async () => {
    const cookie = parseCookie(document.cookie);
    const sessionToken = cookie["session"];
    if (sessionToken) {
      // Make a request to the API to authenticate the user.
      const response = await fetch(`${import.meta.env.VITE_API_URL}/session`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }).then(async (res) => res.json());
      if (!response.user) {
        setAuthStore({
          isLoading: false,
          isAuthenticated: false,
          token: null,
          user: null,
        });
        return;
      }

      setAuthStore({
        isLoading: false,
        isAuthenticated: true,
        token: response.user.token,
        user: response.user,
      });
    } else {
      setAuthStore({
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
      });
    }
  });

  const signOut = () => {
    // remove cookie
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
            <div class="flex items-center text-sm gap-1 cursor-pointer">
              <img class="w-7 h-7 rounded-full" src={user().image} alt={user().name} />
              <span class="text-sm">{user().name}</span>
            </div>
          )}
        </Show>
        <Show
          when={!AuthStore().isAuthenticated}
          fallback={
            <button onClick={signOut} class="ml-4 text-black py-1 px-2 rounded">
              Sign out
            </button>
          }
        >
          <A
            href={`${
              import.meta.env.VITE_AUTH_URL
            }/authorize?provider=google&response_type=code&client_id=google&redirect_uri=http://localhost:3000/api/auth/callback`}
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
