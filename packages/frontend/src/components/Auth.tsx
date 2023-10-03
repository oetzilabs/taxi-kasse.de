import { A } from "@solidjs/router";
import { Accessor, Match, Show, Suspense, Switch, createEffect, createSignal, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { User } from "../../../core/src/entities/users";
import { createContext, Setter } from "solid-js";
import { createQueries, createQuery } from "@tanstack/solid-query";
import { Queries } from "../utils/api/queries";

type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User.Frontend | null;
};

export const AuthContext = createContext<[Accessor<UseAuth>, Setter<UseAuth>]>([
  (() => ({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    user: null,
  })) as Accessor<UseAuth>,
  (() => {}) as Setter<UseAuth>,
]);

export const AuthC = () => {
  const [AuthStore, setAuthStore] = useContext(AuthContext);

  const sessionQuery = createQuery(
    () => ["session"],
    () => {
      return Queries.session(AuthStore().token!);
    },
    {
      get enabled() {
        return AuthStore().token !== null;
      },
      refetchInterval: 1000 * 60 * 5,
    }
  );

  createEffect(() => {
    const isLoading = sessionQuery.isLoading;
    const isAuthenticated = sessionQuery.data?.success && sessionQuery.data?.user ? true : false ?? false;
    let user = null;
    switch (sessionQuery.data?.success ?? false) {
      case true:
        // @ts-ignore
        user = sessionQuery.data?.user;
        break;
      case false:
        user = null;
        break;
      default:
        user = null;
        break;
    }
    const cookie = parseCookie(document.cookie);
    const sessionToken = cookie["session"];

    setAuthStore({
      isLoading,
      isAuthenticated,
      token: sessionToken,
      user,
    });
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
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Match when={AuthStore().isAuthenticated && AuthStore().user}>
          {(user) => (
            <div class="flex w-full flex-row items-center justify-between">
              <div class="flex items-center text-sm gap-1 cursor-pointer">
                <img class="w-7 h-7 rounded-full" src={user().profile.image} alt={user().name} />
                <span class="text-sm">{user().name}</span>
              </div>
              <button onClick={signOut} class="ml-4 py-1 px-2 rounded">
                Sign out
              </button>
            </div>
          )}
        </Match>
        <Match when={!AuthStore().isAuthenticated}>
          <A
            href={`${
              import.meta.env.VITE_AUTH_URL
            }/authorize?provider=google&response_type=code&client_id=google&redirect_uri=http://localhost:3000/api/auth/callback`}
            rel="noreferrer"
            class="text-black py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Sign in with Google
          </A>
        </Match>
      </Switch>
    </Suspense>
  );
};

export const AuthP = (props: { children: any }) => {
  const [AuthStore, setAuthStore] = createSignal<UseAuth>({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    user: null,
  });
  return <AuthContext.Provider value={[AuthStore, setAuthStore]}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used within an AuthProvider");
  return auth;
};
