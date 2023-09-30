import { A, redirect } from "solid-start";
import { useAuth } from "../../components/Auth";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { z } from "zod";
import { API } from "../../utils/api";
import { debounce } from "@solid-primitives/scheduled";
import { createServerAction$ } from "solid-start/server";

// TODO: create company page
// This page should be used to connect or create a company.
// If the user is not logged in, redirect to the login page

const getCompanyData = z.function(z.tuple([z.string()])).implement(async (token) => API.hasCompany(token));

export default function CreateCompanyPage() {
  const [user] = useAuth();
  const [hasCompany, setHasCompany] = createSignal<
    | {
        loading: true;
        result: undefined;
      }
    | {
        loading: false;
        result: Awaited<ReturnType<typeof getCompanyData>>;
      }
  >({
    loading: true,
    result: undefined,
  });

  const [createResults, setCreateResults] = createSignal<Awaited<ReturnType<typeof API.createCompany>>>();

  createEffect(async () => {
    if (!user()) {
      redirect("/login");
    }
    if (!user().isLoading && user().isAuthenticated) {
      const x = await getCompanyData(user().token!);
      setHasCompany({
        loading: false,
        result: x,
      });
    }
  });
  const [companyName, setCompanyName] = createSignal("");
  const [companyEmail, setCompanyEmail] = createSignal("");
  const [companyPhoneNumber, setCompanyPhoneNumber] = createSignal("");

  const [form, X] = createServerAction$(
    async (
      params: {
        token: string;
        name: string;
        email: string;
        phonenumber: string;
      },
      { request }
    ) => {
      const x = await API.createCompany(params.token, {
        name: params.name,
        email: params.email,
        phonenumber: params.phonenumber,
      });
      return redirect(`/company/${x.id}`);
    }
  );

  return (
    <main class="container mx-auto p-4">
      <Show
        when={!hasCompany().loading && hasCompany().result}
        fallback={
          // skeleton
          <div class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-4 py-1">
              <div class="h-8 bg-neutral-200 dark:bg-neutral-900 rounded-sm w-32"></div>
              <div class="space-y-2">
                <div class="h-4 bg-neutral-200 dark:bg-neutral-900 rounded-sm w-2/6"></div>
              </div>
              <div class="space-y-2">
                <div class="flex w-full items-center justify-center rounded-sm bg-neutral-200 dark:bg-neutral-900 p-10" />
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-neutral-200 dark:bg-neutral-900 rounded-sm w-20"></div>
              </div>
            </div>
          </div>
        }
      >
        {(r) => (
          <Show when={r().success && r() && !r().hasCompany}>
            {(s) => (
              <div class="flex flex-col gap-4">
                <h1 class="text-4xl font-bold">Create a company</h1>
                <div class="flex flex-col w-full gap-2">
                  <div class="flex flex-col w-full gap-2">
                    <input type="hidden" name="token" value={user().token ?? ""} />
                    <label class="flex flex-col gap-1">
                      <span>Name</span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={companyName()}
                        onInput={(e) => setCompanyName(e.currentTarget.value)}
                        disabled={form.pending}
                        class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span>Email</span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={companyEmail()}
                        onInput={(e) => setCompanyEmail(e.currentTarget.value)}
                        disabled={form.pending}
                        class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span>Phone number</span>
                      <input
                        type="text"
                        name="phonenumber"
                        value={companyPhoneNumber()}
                        onInput={(e) => setCompanyPhoneNumber(e.currentTarget.value)}
                        disabled={form.pending}
                        class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
                      />
                    </label>
                    <div>
                      <button
                        type="button"
                        onClick={async () => {
                          await X({
                            token: user().token!,
                            name: companyName(),
                            email: companyEmail(),
                            phonenumber: companyPhoneNumber(),
                          });
                        }}
                        disabled={form.pending}
                        class="p-2 flex gap-2 items-center justify-center text-base font-bold bg-black rounded-sm border-black !border-opacity-10 dark:bg-white dark:border-white text-white dark:text-black"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
                <div class="flex w-full">
                  <A
                    href="/company"
                    class="flex flex-row gap-2 items-center bg-white dark:bg-black border border-neutral-100 dark:border-neutral-900 rounded-sm px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-100 dark:focus:ring-neutral-900"
                  >
                    Back
                  </A>
                </div>
              </div>
            )}
          </Show>
        )}
      </Show>
    </main>
  );
}
