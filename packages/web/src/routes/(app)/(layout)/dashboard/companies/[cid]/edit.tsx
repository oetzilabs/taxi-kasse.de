import type { Companies } from "@taxikassede/core/src/entities/companies";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getCompanyById, updateCompany } from "@/lib/api/companies";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A, createAsync, RouteDefinition, RouteSectionProps, useAction, useSubmission } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import { Match, Show, Suspense, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";

export const route = {
  preload: async (props) => {
    const session = await getAuthenticatedSession();
    const company = getCompanyById(props.params.cid);
    return { session, company };
  },
  load: async (props) => {
    const session = await getAuthenticatedSession();
    const company = getCompanyById(props.params.cid);
    return { session, company };
  },
} satisfies RouteDefinition;

const CompanyForm = (props: { company: Companies.Info }) => {
  const [c, setC] = createStore(props.company);
  const updateCompanyAction = useAction(updateCompany);
  const updateCompanyState = useSubmission(updateCompany);
  return (
    <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-col p-6 gap-6">
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            defaultValue={props.company.name}
            name="name"
            onChange={(value) => setC("name", value)}
            disabled={updateCompanyState.pending}
          >
            <TextFieldLabel class="font-bold">Name</TextFieldLabel>
            <TextField />
          </TextFieldRoot>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            defaultValue={props.company.email}
            name="email"
            onChange={(value) => setC("email", value)}
            disabled={updateCompanyState.pending}
          >
            <TextFieldLabel class="font-bold">Email</TextFieldLabel>
            <TextField />
          </TextFieldRoot>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            defaultValue={props.company.phoneNumber ?? ""}
            name="phoneNumber"
            onChange={(value) => setC("phoneNumber", value)}
            disabled={updateCompanyState.pending}
          >
            <TextFieldLabel class="font-bold">Phone Number</TextFieldLabel>
            <TextField type="phone" />
          </TextFieldRoot>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            defaultValue={props.company.website ?? ""}
            name="website"
            onChange={(value) => setC("website", value)}
            disabled={updateCompanyState.pending}
          >
            <TextFieldLabel class="font-bold">Website</TextFieldLabel>
            <TextField />
          </TextFieldRoot>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            defaultValue={props.company.uid ?? ""}
            name="uid"
            onChange={(value) => setC("uid", value)}
            disabled={updateCompanyState.pending}
          >
            <TextFieldLabel class="font-bold">UID</TextFieldLabel>
            <TextField />
          </TextFieldRoot>
        </div>
        <div class="flex flex-row items-center justify-end gap-4">
          <Button
            class="w-max"
            disabled={updateCompanyState.pending}
            onClick={() => {
              if (!c.id) {
                toast.error("Failed to save! Please fill out all fields.");
                return;
              }

              toast.promise(updateCompanyAction(c), {
                loading: "Saving...",
                success: "Saved!",
                error: (e) => `Failed to save! ${e.message}`,
              });
            }}
          >
            <Switch fallback={<span>Save</span>}>
              <Match when={updateCompanyState.pending}>
                <span>Saving...</span>
              </Match>
            </Switch>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardEditPage(props: RouteSectionProps) {
  const session = createAsync(() => getAuthenticatedSession());

  const company = createAsync(() => getCompanyById(props.params.cid));

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-6">
            <div class="flex flex-col w-full items-center justify-center gap-6">
              <Suspense
                fallback={
                  <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
                    <Loader2 class="size-4 animate-spin" />
                  </div>
                }
              >
                <Show
                  when={company() && company()}
                  fallback={
                    <div class="flex flex-col w-full pb-4 gap-4">
                      <div class="flex flex-col w-full items-center justify-center rounded-md px-4 py-20 gap-2 bg-neutral-200 dark:bg-neutral-800">
                        <span class="text-sm">You currently have no companies.</span>
                        <span class="text-sm">
                          Please{" "}
                          <A href="/dashboard/vehicles/new" class="hover:underline text-blue-500 font-medium">
                            create/join a companies
                          </A>{" "}
                          to view your list of companies.
                        </span>
                      </div>
                    </div>
                  }
                >
                  {(c) => <CompanyForm company={c()} />}
                </Show>
              </Suspense>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
