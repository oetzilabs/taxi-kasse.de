import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { send } from "@/lib/api/mail";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { createSignal } from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function MailsPage() {
  const [toEmail, setMail] = createSignal("");
  const sendTestMailAction = useAction(send);
  const sendTestMailsubmission = useSubmission(send);

  return (
    <div class="flex flex-col gap-4">
      <h1>Send Test Mail</h1>
      <TextFieldRoot value={toEmail()} onChange={(v) => setMail(v)}>
        <TextField placeholder="Email" />
      </TextFieldRoot>
      <Button
        disabled={toEmail().length === 0 || sendTestMailsubmission.pending}
        onClick={() => {
          toast.promise(sendTestMailAction(toEmail()), {
            loading: "Sending test mail...",
            success: "Test mail sent",
            error(error) {
              return error.message;
            },
          });
        }}
      >
        Send Test Mail to {toEmail()}
      </Button>
    </div>
  );
}
