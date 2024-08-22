import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { A } from "@solidjs/router";
import type { SVGAttributes } from "lucide-solid";
import { createSignal, For, JSX } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
};

const generateAuthUrl = (provider: string) => {
  const url = new URL(`${import.meta.env.VITE_AUTH_URL}${provider}/authorize`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", provider);
  url.searchParams.set(
    "redirect_uri",
    (import.meta.env.NODE_ENV === "production" ? "https://taxi-kasse.de" : "http://localhost:3000") +
      "/api/auth/callback",
  );
  return url.toString();
};

const logins = {
  google: generateAuthUrl("google"),
} as const;

export type Logins = keyof typeof logins;

const logos: Record<Logins, (props: SVGAttributes) => JSX.Element> = {
  google: (props: SVGAttributes) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 13.9V10.18H21.36C21.5 10.81 21.61 11.4 21.61 12.23C21.61 17.94 17.78 22 12.01 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C14.7 2 16.96 2.99 18.69 4.61L15.85 7.37C15.13 6.69 13.88 5.88 12 5.88C8.69 5.88 5.99 8.63 5.99 12C5.99 15.37 8.69 18.12 12 18.12C15.83 18.12 17.24 15.47 17.5 13.9H12Z"
        fill="currentColor"
      />
    </svg>
  ),
};

const randomPersonTesimonial = {
  name: "Özgür Isbert",
  title: "Software Engineer",
  testimonial: "I might be biased, but it works as if I made it myself - It's that good.",
};

export default function LoginPage() {
  const [email, setEmail] = createSignal<string>("");

  const [submitting, setSubmitting] = createSignal<boolean>();

  let formRef: HTMLFormElement;

  return (
    <div class="md:container h-[calc(100vh-49px)] flex flex-col items-center justify-center md:px-10">
      <div class="w-full h-[650px] md:border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-clip">
        <div class="w-full relative flex h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div class="relative hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
            <div class="absolute inset-0 bg-neutral-100 dark:bg-neutral-900" />
            <div class="relative z-20 flex items-center text-lg gap-2 font-black">HomeSec.</div>
            <div class="relative z-20 mt-auto">
              <blockquote class="space-y-2">
                <p class="">&ldquo;{randomPersonTesimonial.testimonial}&rdquo;</p>
                <p class="text-sm">
                  {randomPersonTesimonial.name} - {randomPersonTesimonial.title}
                </p>
              </blockquote>
            </div>
          </div>
          <div class="p-8 w-full">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[300px]">
              <div class="relative z-20 flex lg:hidden items-center text-lg font-black gap-2 justify-center">
                HomeSec.
              </div>
              <div class="flex flex-col space-y-4 text-center">
                <h1 class="text-2xl font-semibold tracking-tight">HomeSec.</h1>
                <p class="text-sm text-muted-foreground">Login via your preferred method</p>
              </div>
              <div class="flex flex-col gap-4 items-center w-full">
                <For each={Object.entries(logins) as [Logins, string][]}>
                  {([provider, url]) => {
                    const L = logos[provider];
                    return (
                      <Button
                        as={A}
                        class="w-full flex items-center justify-center text-sm font-medium gap-4 capitalize !py-5"
                        href={url}
                      >
                        <L class="h-5 w-5" />
                        <span>{provider}</span>
                      </Button>
                    );
                  }}
                </For>
              </div>
              <div class="px-8 text-center text-sm text-muted-foreground gap-4 flex flex-col">
                <span>By continuing, you agree to our</span>
                <div class="">
                  <A href="/terms-of-service" class="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </A>{" "}
                  and{" "}
                  <A href="/privacy" class="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </A>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
