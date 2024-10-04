import { Button } from "@/components/ui/button";
import { checkVerification, getAuthenticatedSession, sendVerificationEmail } from "@/lib/auth/util";
import { createAsync, revalidate, RouteDefinition, useNavigate, useSubmission } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import Send from "lucide-solid/icons/send";
import { onCleanup, onMount, Show } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const verified = await checkVerification();
    return { session, verified };
  },
} satisfies RouteDefinition;

export default function VerifyEmailPage() {
  const sendingVerification = useSubmission(sendVerificationEmail);

  const verified = createAsync(() => checkVerification());
  const navigate = useNavigate();

  onMount(() => {
    const interval = setInterval(async () => {
      await revalidate([checkVerification.key]);
      const isVerified = verified();
      if (isVerified) {
        navigate("/dashboard");
      }
    }, 5000);
    onCleanup(() => {
      clearInterval(interval);
    });
  });

  return (
    <div class="h-[calc(100vh-73px)] flex flex-col pt-20">
      <div class="w-full grow flex flex-col items-center justify-start gap-8">
        <div class="w-full flex flex-col items-center h-max gap-4">
          <Show
            when={verified() && verified()}
            fallback={<span class="text-center text-sm">Please verify your email address</span>}
          >
            <span class="text-center text-sm">Your email address is verified, we are ready to go!</span>
          </Show>
          <span class="text-muted-foreground text-xs">
            This page will redirect you once you have verified your email address.
          </span>
        </div>
        <form action={sendVerificationEmail} method="post">
          <Button class="flex flex-row gap-2" type="submit" size="sm" disabled={sendingVerification.pending}>
            <Show
              when={sendingVerification.pending}
              fallback={
                <>
                  <Send class="size-4" />
                  <span>Send Verification Again</span>
                </>
              }
            >
              <Loader2 class="size-4 animate-spin" />
              <span>Sending Verification...</span>
            </Show>
          </Button>
        </form>
      </div>
    </div>
  );
}
