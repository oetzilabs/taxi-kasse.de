import { attachDevtoolsOverlay } from "@solid-devtools/overlay";
import { mount, StartClient } from "solid-start/entry-client";

mount(() => <StartClient />, document);

attachDevtoolsOverlay();

// or with some options

attachDevtoolsOverlay({
  defaultOpen: false, // or alwaysOpen
  noPadding: true,
});
