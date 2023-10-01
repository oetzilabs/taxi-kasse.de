import { Show, createSignal } from "solid-js";
import { A, redirect } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { useAuth } from "../../components/Auth";
import { API } from "../../utils/api";
import { createMutation } from "@tanstack/solid-query";
import { Mutations, createCompany } from "../../utils/api/mutations";

export default function CreateCompanyPage() {
  const [user] = useAuth();
  const hasCompany = () => (user().isAuthenticated && !!user().user?.companyId) ?? false;

  const [companyName, setCompanyName] = createSignal("");
  const [companyEmail, setCompanyEmail] = createSignal("");
  const [companyPhoneNumber, setCompanyPhoneNumber] = createSignal("");

  const createCompany = createMutation(() => {
    return Mutations.createCompany(user().token!, {
      name: companyName(),
      email: companyEmail(),
      phonenumber: companyPhoneNumber(),
    });
  });

  return (
    <main class="container mx-auto p-4">
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
                disabled={createCompany.isLoading}
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
                disabled={createCompany.isLoading}
                class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
              />
            </label>
            <label class="flex flex-col gap-1">
              <span>Phone number</span>
              <input
                type="phone"
                name="phonenumber"
                value={companyPhoneNumber()}
                onInput={(e) => setCompanyPhoneNumber(e.currentTarget.value)}
                disabled={createCompany.isLoading}
                class="w-full rounded-sm bg-transparent border border-neutral-200 dark:border-neutral-800 px-2 py-1"
              />
            </label>
            <div>
              <button
                type="button"
                onClick={async () => {
                  const company = await createCompany.mutateAsync();
                  window.location.href = `/company/${company.id}`;
                }}
                disabled={createCompany.isLoading}
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
    </main>
  );
}
