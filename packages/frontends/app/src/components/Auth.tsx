import { A } from "@solidjs/router";
import { Accessor, Match, Show, Suspense, Switch, createEffect, createSignal, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { User } from "../../../../core/src/entities/users";
import { createContext, Setter } from "solid-js";
import { createQueries, createQuery } from "@tanstack/solid-query";
import { Queries } from "../utils/api/queries";
import { SetStoreFunction, createStore } from "solid-js/store";

type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User.Frontend | null;
};

const [AuthStore, setAuthStore] = createStore<UseAuth>({
  isLoading: true,
  isAuthenticated: false,
  token: null,
  user: null,
});

export const Auth = () => {
  const sessionQuery = createQuery(() => ({
    queryKey: ["session"],
    queryFn: () => {
      const _as = AuthStore;
      const token = _as.token;
      if (!token) return Promise.reject("No token");
      return Queries.Users.session(token);
    },
    get enabled() {
      const _as = AuthStore;
      const token = _as.token;
      return token !== null;
    },
    refetchInterval: 1000 * 60 * 5,
    // refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  }));

  createEffect(() => {
    if (!sessionQuery.isSuccess) {
      // get the token from the cookie
      const cookie = parseCookie(document.cookie);
      const sessionToken = cookie["session"];
      if (sessionToken) {
        setAuthStore({
          isLoading: true,
          isAuthenticated: false,
          token: sessionToken,
          user: null,
        });
        sessionQuery.refetch();
      } else {
        setAuthStore({
          isLoading: false,
          isAuthenticated: false,
          token: null,
          user: null,
        });
      }
      return;
    }
    const isLoading = sessionQuery.isPending;
    const isAuthenticated = sessionQuery.data.success && sessionQuery.data.user ? true : false ?? false;
    let user = null;
    switch (sessionQuery.data.success) {
      case true:
        user = sessionQuery.data.user;
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

  return (
    <div
      data-auth-loading={AuthStore.isLoading ? "true" : "false"}
      data-auth-is-authenticated={AuthStore.isAuthenticated ? "true" : "false"}
    ></div>
  );
};

export const useAuth = () => {
  return [AuthStore, setAuthStore] as [UseAuth, SetStoreFunction<UseAuth>];
};

export const useAuthUrl = () => {
  const authUrl = new URLSearchParams({
    provider: "google",
    response_type: "code",
    client_id: "google",
    redirect_uri: import.meta.env.VITE_AUTH_REDIRECT_URL,
  });
  return authUrl.toString();
};

export const useSignOut = () => {
  // remove cookie
  return () => {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setAuthStore({
      isLoading: false,
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };
};
