import { A, AnchorProps } from "@solidjs/router";
import { JSX } from "solid-js";

export default function NavLink(props: AnchorProps) {
  return (
    <A {...props} class={props.class ? props.class + " hover:bg-gray-700" : "hover:bg-gray-700"} href={props.href} />
  );
}
