import { mount, StartClient } from "@solidjs/start/client";
import "solid-devtools";
import { attachDevtoolsOverlay } from "@solid-devtools/overlay";

attachDevtoolsOverlay({
  defaultOpen: false, // or alwaysOpen
  noPadding: true,
});

mount(() => <StartClient />, document.getElementById("app")!);
