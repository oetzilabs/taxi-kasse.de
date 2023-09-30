import { A } from "@solidjs/router";
import { Accessor, Show, createEffect, createSignal, useContext } from "solid-js";
import { parseCookie } from "solid-start";
import { User } from "../../../core/src/entities/users";
import { createContext, Setter } from "solid-js";

type UseAuth =
  | {
      isLoading: true;
      isAuthenticated: false;
      token: null;
      user: null;
    }
  | {
      isLoading: false;
      isAuthenticated: true;
      token: string;
      user: User.Frontend;
    }
  | {
      isLoading: false;
      isAuthenticated: false;
      token: null;
      user: null;
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

  createEffect(async () => {
    const cookie = parseCookie(document.cookie);
    const sessionToken = cookie["session"];
    if (sessionToken) {
      if (import.meta.env.VITE_API_URL) {
        // Make a request to the API to authenticate the user.
        const response = await fetch(`${import.meta.env.VITE_API_URL}/session`, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }).then(async (res) => await res.json());
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
          token: sessionToken,
          user: response.user,
        });
      } else {
        setAuthStore({
          isLoading: false,
          isAuthenticated: true,
          token: "",
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
            companyId: null,
            company: null,
            day_entries: [],
            profile: {
              id: "1",
              image: "",
              createdAt: new Date(),
              updatedAt: null,
              deletedAt: null,
              userId: "1",
              phoneNumber: "1234567890",
              birthdate: new Date().toISOString(),
              preferredUsername: "testuser",
              locale: "en-US",
            },
          },
        });
      }
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
    <Show when={!AuthStore().isLoading} fallback={<div>Loading...</div>}>
      <Show when={AuthStore().isAuthenticated && AuthStore().user}>
        {(user) => (
          <div class="flex items-center text-sm gap-1 cursor-pointer">
            <img class="w-7 h-7 rounded-full" src={user().profile.image} alt={user().name} />
            <span class="text-sm">{user().name}</span>
          </div>
        )}
      </Show>
      <Show
        when={!AuthStore().isAuthenticated}
        fallback={
          <button onClick={signOut} class="ml-4 py-1 px-2 rounded">
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
