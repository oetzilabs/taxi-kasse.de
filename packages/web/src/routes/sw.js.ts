import { getManifest } from "vinxi/manifest";

const prodServiceWorker = "/_build/entry-serviceworker.js";

export async function GET() {
  const manifest = getManifest("client");
  const chunks = manifest.json();
  const assets = new Set<string>();
  for (const { output, assets: chunkAssets } of Object.values(chunks)) {
    assets.add(output);
    for (const asset of chunkAssets) {
      if (typeof asset.attrs?.href === "string") {
        assets.add(asset.attrs.href);
      }
    }
  }

  const config = {
    cache: import.meta.env.PROD,
  };

  return new Response(
    `self.__SW_CONFIG__=${JSON.stringify(config)};
self.__SW_ASSETS__=${JSON.stringify(Array.from(assets))};
self.importScripts("${prodServiceWorker}");
`,
    {
      headers: { "content-type": "application/javascript" },
    }
  );
}
