import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { createOrganization, joinOrganization } from "@/lib/api/organizations";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function DashboardPage() {
  const session = createAsync(() => getAuthenticatedSession());
  const [organizationName, setOrganizationName] = createSignal("");
  const [phoneNumber, setPhoneNumber] = createSignal("");
  const [email, setEmail] = createSignal("");

  const createOrganizationAction = useAction(createOrganization);
  const joinOrganizationAction = useAction(joinOrganization);
  const createOrganizationStatus = useSubmission(createOrganization);
  const joinOrganizationStatus = useSubmission(joinOrganization);

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-4">
            <h2 class="text-lg font-bold">Organization Management</h2>
            <span class="text-sm text-muted-foreground">Create or join an organization</span>
            <div>
              <Tabs defaultValue="create">
                <TabsList class="grid w-full grid-cols-2">
                  <TabsIndicator />
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="join">Join</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                  <div class="space-y-4">
                    <div>
                      <TextFieldRoot value={organizationName()} onChange={(value) => setOrganizationName(value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Organization Name</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter organization name" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot value={phoneNumber()} onChange={(value) => setPhoneNumber(value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Organization Phone Number</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter organization phone number" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot value={email()} onChange={(value) => setEmail(value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Organization Email</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter organization email" />
                      </TextFieldRoot>
                    </div>
                    <Button
                      class="w-full"
                      onClick={() => {
                        const name = organizationName();
                        if (name.length === 0) {
                          toast.error("Please enter an organization name");
                          return;
                        }
                        const pn = phoneNumber();
                        if (pn.length === 0) {
                          toast.error("Please enter an organization phone number");
                          return;
                        }
                        const em = email();
                        if (em.length === 0) {
                          toast.error("Please enter an organization email");
                          return;
                        }
                        toast.promise(createOrganizationAction(name, pn, em), {
                          loading: "Creating organization...",
                          success: "Organization created",
                          error: (e) => "Could not create organization: " + e.message,
                        });
                      }}
                      disabled={createOrganizationStatus.pending}
                    >
                      Create Organization
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="join">
                  <div class="space-y-4">
                    <TextFieldRoot value={organizationName()} onChange={(value) => setOrganizationName(value)}>
                      <TextFieldLabel>
                        <span class="text-sm font-bold">Organization Name</span>
                      </TextFieldLabel>
                      <TextField placeholder="Enter organization name" />
                    </TextFieldRoot>
                    <Button
                      class="w-full"
                      onClick={() => {
                        const name = organizationName();
                        if (name.length === 0) {
                          toast.error("Please enter an organization name");
                          return;
                        }
                        toast.promise(joinOrganizationAction(name), {
                          loading: "Joining organization...",
                          success: "Organization joined",
                          error: "Could not join organization",
                        });
                      }}
                      disabled={joinOrganizationStatus.pending}
                    >
                      Join Organization
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
