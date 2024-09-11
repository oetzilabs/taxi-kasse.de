import { cf, domain, zone } from "./Domain";
import { allSecrets } from "./Secrets";

export const mainEmail = new sst.aws.Email("MainEmail", {
  sender: domain,
  dns: cf,
});

// export const emailRoutingSettings = new cloudflare.EmailRoutingSettings("MainEmailRoutingSettings", {
//   zoneId: zone.zoneId,
//   enabled: true,
//   skipWizard: false,
// });

// export const infoMailRoutingAddress = new cloudflare.EmailRoutingAddress("InfoMailAddress", {
//   email: $interpolate`info@${mainEmail.sender}`,
//   accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
// });

// export const mainEmailWorker = new sst.cloudflare.Worker("MainEmailWorker", {
//   handler: "packages/functions/src/email/sender.ts",
//   url: true,
//   domain: `email.${domain}`,
//   link: [...allSecrets, mainEmail],
//   transform: {
//     worker: {
//       compatibilityFlags: ["nodejs_compat", "nodejs_compat_v2", "nodejs_als"],
//       compatibilityDate: "2024-09-06",
//     },
//   },
// });

// export const infoMailRoutingRule = new cloudflare.EmailRoutingRule("InfoMailRoutingRule", {
//   name: "InfoMailRoutingRule",
//   zoneId: zone.zoneId,
//   matchers: [{ type: "literal", value: $interpolate`info@${mainEmail.sender}` }],
//   actions: [
//     {
//       type: "worker",
//       values: [mainEmailWorker.nodes.worker.id],
//     },
//     {
//       type: "forward",
//       values: ["oezguerisbert@gmail.com"],
//     },
//   ],
//   enabled: true,
// });

// // Set up a catch-all rule to forward unmatched emails to a default address
// export const catchAll = new cloudflare.EmailRoutingCatchAll("MainMailCatchAll", {
//   name: "MainMailCatchAll",
//   zoneId: zone.zoneId,
//   actions: [
//     {
//       type: "forward",
//       values: ["oezguerisbert@gmail.com"], // Unmatched emails will be forwarded to this address
//     },
//   ],
//   matchers: [{ type: "all" }],
//   enabled: true,
// });
