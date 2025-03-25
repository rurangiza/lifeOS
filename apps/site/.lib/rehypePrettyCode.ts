import { type Options } from "rehype-pretty-code"
// import vercelLightTheme from "./lib/themes/vercel-light.json"
 
export const rehypePrettyCodeOptions: Partial<Options> = {
  // prepackaged theme: https://shiki.style/themes#themes
  theme: "material-theme-lighter",
  // or import a custom theme
  // theme: JSON.parse(vercelLightTheme),
}