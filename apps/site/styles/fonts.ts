import localFont from "next/font/local";
import { Fira_Code } from "next/font/google";

const fira_code = Fira_Code({
  subsets: ['latin'],
})

const wotfard = localFont({
  src: [
    {
      path: "../assets/font/wotfard-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/font/wotfard-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/font/wotfard-regularitalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/font/wotfard-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/font/wotfard-mediumitalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/font/wotfard-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/font/wotfard-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../assets/font/wotfard-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ]
});

export { wotfard, fira_code }
