import "@fontsource-variable/familjen-grotesk";
import "@fontsource/barlow-semi-condensed/500.css";
import "@fontsource/barlow-semi-condensed/600.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadState, requestPersistence } from "./lib/storage";
import { failLoad, hydrate } from "./lib/store";
import "./styles.css";

// If loading fails the app stays read-only rather than starting empty, so a
// passing storage error can never overwrite what is saved.
loadState().then(hydrate, (err: unknown) => {
  console.error("Could not load saved data", err);
  failLoad(err instanceof Error ? err.message : String(err));
});
void requestPersistence();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
