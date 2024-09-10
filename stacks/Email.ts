import { cf, domain } from "./Domain";
import { allSecrets } from "./Secrets";

export const mainEmail = new sst.aws.Email("MainEmail", {
  sender: domain,
  dns: cf,
});

export const mainEmailWorker = new sst.cloudflare.Worker("MainEmailWorker", {
  handler: "packages/functions/src/email/sender.ts",
  url: true,
  domain: `email.${domain}`,
  link: [...allSecrets, mainEmail],
  build: {
    esbuild: {
      external: ["cloudflare:email"],
    },
  },
  transform: {
    worker: {
      compatibilityFlags: ["nodejs_compat", "nodejs_compat_v2", "nodejs_als"],
      compatibilityDate: "2024-09-06",
    },
  },
});
