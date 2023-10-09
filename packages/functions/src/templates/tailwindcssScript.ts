import fetch from "node-fetch";

export const tailwindcssScript = () => fetch("https://cdn.tailwindcss.com/3.3.3").then((res) => res.text());
