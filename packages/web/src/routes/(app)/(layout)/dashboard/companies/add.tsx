import type { Companies } from "@taxikassede/core/src/entities/companies";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { createCompany, joinCompany } from "@/lib/api/companies";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { InferInput } from "valibot";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
  load: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function CompanyAddPage() {
  const session = createAsync(() => getAuthenticatedSession());
  const [companyName, setCompanyName] = createSignal("");
  const [phoneNumber, setPhoneNumber] = createSignal("");
  const [email, setEmail] = createSignal("");

  const createCompanyAction = useAction(createCompany);
  const joinCompanyAction = useAction(joinCompany);
  const createCompanyStatus = useSubmission(createCompany);
  const joinCompanyStatus = useSubmission(joinCompany);
  const [company, setCompany] = createStore<InferInput<typeof Companies.CreateWithoutOwnerAndCharges>>({
    name: "",
    email: "",
    phoneNumber: "",
    image: "",
    banner: "",
    website: "",
    uid: "",
  });

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
                      <TextFieldRoot value={company.name} onChange={(value) => setCompany("name", value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company Name</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company name" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot
                        value={company.phoneNumber ?? ""}
                        onChange={(value) => setCompany("phoneNumber", value)}
                      >
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company Phone Number</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company phone number" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot value={company.email} onChange={(value) => setCompany("email", value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company Email</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company email" />
                      </TextFieldRoot>
                    </div>
                    <div>
                      <TextFieldRoot value={company.uid} onChange={(value) => setCompany("uid", value)}>
                        <TextFieldLabel>
                          <span class="text-sm font-bold">Company UID</span>
                        </TextFieldLabel>
                        <TextField placeholder="Enter Company UID" />
                      </TextFieldRoot>
                    </div>
                    <Button
                      class="w-full"
                      onClick={() => {
                        if (company.name.length === 0) {
                          toast.error("Please enter a Company name");
                          return;
                        }
                        if (!company.phoneNumber || company.phoneNumber.length === 0) {
                          toast.error("Please enter a Company phone number");
                          return;
                        }
                        if (company.email.length === 0) {
                          toast.error("Please enter a Company email");
                          return;
                        }
                        if (company.uid.length === 0) {
                          toast.error("Please enter a Company UID");
                          return;
                        }

                        toast.promise(createCompanyAction(company), {
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
