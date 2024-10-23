import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { sendMail } from "@/lib/api/mail";
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
  const [mail, setMail] = createSignal("");
  const sendTestMailAction = useAction(sendMail);
  const sendTestMailsubmission = useSubmission(sendMail);

  return (
    <div class="flex flex-col gap-4">
      <h1>Send Test Mail</h1>
      <TextFieldRoot value={mail()} onChange={(v) => setMail(v)}>
        <TextField placeholder="Email" />
      </TextFieldRoot>
      <Button
        disabled={mail().length === 0 || sendTestMailsubmission.pending}
        onClick={() => {
          toast.promise(sendTestMailAction(mail()), {
            loading: "Sending test mail...",
            success: "Test mail sent",
            error(error) {
              return error.message;
            },
          });
        }}
      >
        {" "}
        Send Test Mail to {mail()}
      </Button>
    </div>
  );
}
