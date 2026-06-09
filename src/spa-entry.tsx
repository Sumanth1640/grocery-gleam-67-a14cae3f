// Pure client-side SPA entry for the Hostinger static build.
// The default TanStack Start entry calls hydrateRoot(document, ...) which
// throws "Invariant failed" when the served HTML is just <div id="root"></div>
// (no SSR markup). For the static SPA we render via createRoot + RouterProvider
// instead — shellComponent is intentionally bypassed (the static index.html is
// the shell).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./lib/error-capture";
import "./styles.css";
import { getRouter } from "./router";

const router = getRouter();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element missing in index.html");

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
