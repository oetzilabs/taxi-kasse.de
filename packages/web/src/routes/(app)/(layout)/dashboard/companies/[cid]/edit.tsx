import type { Companies } from "@taxikassede/core/src/entities/companies";
import type { Organizations } from "@taxikassede/core/src/entities/organizations";
import { language } from "@/components/stores/Language";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NumberField, NumberFieldInput, NumberFieldLabel } from "@/components/ui/number-field";
import { Separator } from "@/components/ui/separator";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getCompanyById, resetCompanyChargesToOrganization, updateCompany } from "@/lib/api/companies";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { parseLocaleNumber } from "@/lib/utils";
import {
  A,
  createAsync,
  revalidate,
  RouteDefinition,
  RouteSectionProps,
  useAction,
  useSubmission,
} from "@solidjs/router";
import Building2 from "lucide-solid/icons/building-2";
import Info from "lucide-solid/icons/info";
import Loader2 from "lucide-solid/icons/loader-2";
import { Accessor, createMemo, For, Match, Show, Suspense, Switch } from "solid-js";
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

const CompanyForm = (props: { organizations: Organizations.Info[]; company: Accessor<Companies.Info> }) => {
  const [c, setC] = createStore(props.company());
  const updateCompanyAction = useAction(updateCompany);
  const updateCompanyState = useSubmission(updateCompany);
  const resetCompanyChargesToOrganizationAction = useAction(resetCompanyChargesToOrganization);
  const resetCompanyChargesToOrganizationState = useSubmission(resetCompanyChargesToOrganization);

  const getSameValuesAsOrganization = createMemo(() => {
    // find the organization that has the same charges as the company
    const org = props.organizations.find((org) => {
      return (
        org.base_charge === c.base_charge &&
        org.distance_charge === c.distance_charge &&
        org.time_charge === c.time_charge
      );
    });
    return org;
  });

  return (
    <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-col p-6 gap-6">
        <div class="flex flex-col gap-2 w-full">
          <TextFieldRoot
            value={c.name}
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
            value={c.email}
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
            value={c.phoneNumber ?? ""}
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
            value={c.website ?? ""}
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
            value={c.uid ?? ""}
            name="uid"
            onChange={(value) => setC("uid", value)}
            disabled={updateCompanyState.pending}
          >
            <TextFieldLabel class="font-bold">UID</TextFieldLabel>
            <TextField />
          </TextFieldRoot>
        </div>
        <div class="flex flex-col gap-2 w-full p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex flex-row gap-2 w-full justify-between items-center">
            <div class="w-full">
              <span class="font-bold">Company Charges</span>
            </div>
            <div class="w-max flex flex-row items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  as={Button}
                  size="sm"
                  variant="secondary"
                  class="w-max"
                  disabled={resetCompanyChargesToOrganizationState.pending}
                >
                  Reset to Organization
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <For each={props.organizations}>
                    {(org) => (
                      <DropdownMenuItem
                        onSelect={async () => {
                          toast.promise(resetCompanyChargesToOrganizationAction(c.id, org.id), {
                            loading: "Resetting...",
                            success: "Reset!",
                            error: (e) => `Failed to reset! ${e.message}`,
                          });
                          await revalidate([getAuthenticatedSession.key, getCompanyById.keyFor(c.id)]);
                          setC(props.company());
                        }}
                        disabled={resetCompanyChargesToOrganizationState.pending}
                      >
                        <Building2 class="size-4" />
                        {org.name}
                      </DropdownMenuItem>
                    )}
                  </For>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Show
            when={getSameValuesAsOrganization()}
            fallback={
              <Alert>
                <Info class="h-4 w-4" />
                <AlertTitle>Values are different from Organization</AlertTitle>
                <AlertDescription>
                  These values are different from any of your organizations. This is most likely made by design. You can
                  reset them to the organization's values via the dropdown menu.
                </AlertDescription>
              </Alert>
            }
          >
            {(sameOrg) => (
              <Alert>
                <Info class="h-4 w-4" />
                <AlertTitle>Same Values as Organization</AlertTitle>
                <AlertDescription>
                  These values are the same as the <b>'{sameOrg().name}'</b> organization's values. Please change them
                  in the organization.
                </AlertDescription>
              </Alert>
            )}
          </Show>
          <div class="flex flex-col gap-2 w-full">
            <NumberField
              value={c.base_charge ?? ""}
              name="base_charge"
              onChange={(value) => setC("base_charge", value)}
              disabled={updateCompanyState.pending || resetCompanyChargesToOrganizationState.pending}
              minValue={0}
            >
              <NumberFieldLabel class="font-bold">Base Charge (Grundtaxe)</NumberFieldLabel>
              <NumberFieldInput />
            </NumberField>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <NumberField
              value={c.distance_charge ?? ""}
              name="distance_charge"
              onChange={(value) => setC("distance_charge", value)}
              disabled={updateCompanyState.pending || resetCompanyChargesToOrganizationState.pending}
              minValue={0}
            >
              <NumberFieldLabel class="font-bold">Distance Charge (km)</NumberFieldLabel>
              <NumberFieldInput />
            </NumberField>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <NumberField
              value={c.time_charge ?? ""}
              name="time_charge"
              onChange={(value) => setC("time_charge", value)}
              disabled={updateCompanyState.pending || resetCompanyChargesToOrganizationState.pending}
              minValue={0}
            >
              <NumberFieldLabel class="font-bold">Time Charge (pro minute)</NumberFieldLabel>
              <NumberFieldInput />
            </NumberField>
          </div>
        </div>
        <div class="flex flex-row items-center justify-end gap-4">
          <Button
            class="w-max"
            disabled={updateCompanyState.pending}
            onClick={async () => {
              if (!c.id) {
                toast.error("Failed to save! Please fill out all fields.");
                return;
              }

              const bC = c.base_charge ? parseLocaleNumber(language(), c.base_charge) : undefined;
              const dC = c.distance_charge ? parseLocaleNumber(language(), c.distance_charge) : undefined;
              const tC = c.time_charge ? parseLocaleNumber(language(), c.time_charge) : undefined;

              toast.promise(updateCompanyAction({ ...c, base_charge: bC, distance_charge: dC, time_charge: tC }), {
                loading: "Saving...",
                success: "Saved!",
                error: (e) => `Failed to save! ${e.message}`,
              });
              await revalidate([getAuthenticatedSession.key, getCompanyById.keyFor(c.id)]);
              setC(props.company());
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
                  {(c) => <CompanyForm company={c} organizations={s().organizations} />}
                </Show>
              </Suspense>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
