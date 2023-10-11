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
