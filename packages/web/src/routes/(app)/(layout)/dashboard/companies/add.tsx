import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { createCompany, joinCompany } from "@/lib/api/companies";
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
  const [companyName, setCompanyName] = createSignal("");
  const [phoneNumber, setPhoneNumber] = createSignal("");
  const [email, setEmail] = createSignal("");

  const createCompanyAction = useAction(createCompany);
  const joinCompanyAction = useAction(joinCompany);
  const createCompanyStatus = useSubmission(createCompany);
  const joinCompanyStatus = useSubmission(joinCompany);

  return (
    <div class="w-full grow flex flex-col">
      <Show when={session()}>
        {(s) => (
          <div class="flex flex-col w-full py-4 gap-4">
            <h2 class="text-lg font-bold">Company Management</h2>
            <span class="text-sm text-muted-foreground">Create or join an Company</span>
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
                      <TextFieldRoot value={companyName()} onChange={(value) => setCompanyName(value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company Name</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company name" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot value={phoneNumber()} onChange={(value) => setPhoneNumber(value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company Phone Number</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company phone number" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot value={email()} onChange={(value) => setEmail(value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company Email</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company email" />
                      </TextFieldRoot>
                    </div>
                    <Button
                      class="w-full"
                      onClick={() => {
                        const name = companyName();
                        if (name.length === 0) {
                          toast.error("Please enter an Company name");
                          return;
                        }
                        const pn = phoneNumber();
                        if (pn.length === 0) {
                          toast.error("Please enter an Company phone number");
                          return;
                        }
                        const em = email();
                        if (em.length === 0) {
                          toast.error("Please enter an Company email");
                          return;
                        }
                        toast.promise(createCompanyAction(name, pn, em), {
                          loading: "Creating Company...",
                          success: "Company Created",
                          error: (e) => "Could not create Company: " + e.message,
                        });
                      }}
                      disabled={createCompanyStatus.pending}
                    >
                      Create Company
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="join">
                  <div class="space-y-4">
                    <TextFieldRoot value={companyName()} onChange={(value) => setCompanyName(value)}>
                      <TextFieldLabel>
                        <span class="text-sm font-bold">Company Name</span>
                      </TextFieldLabel>
                      <TextField placeholder="Enter Company name" />
                    </TextFieldRoot>
                    <Button
                      class="w-full"
                      onClick={() => {
                        const name = companyName();
                        if (name.length === 0) {
                          toast.error("Please enter an Company name");
                          return;
                        }
                        toast.promise(joinCompanyAction(name), {
                          loading: "Joining Company...",
                          success: "Company joined",
                          error: "Could not join Company",
                        });
                      }}
                      disabled={joinCompanyStatus.pending}
                    >
                      Join Company
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
