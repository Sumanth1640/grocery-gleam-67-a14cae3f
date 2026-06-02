import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultPending() {
  // Rendered into the SPA shell at build time and on every initial load before
  // route matches resolve. Must be route-agnostic so the prerendered
  // dist/client/index.html hydrates cleanly on ANY URL (e.g. /admin).
  return (
    <div
      aria-hidden
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--background, #fff)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "3px solid rgba(0,0,0,0.1)",
          borderTopColor: "rgba(0,0,0,0.55)",
          borderRadius: "50%",
          animation: "tss-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes tss-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: DefaultPending,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  });

  return router;
};
