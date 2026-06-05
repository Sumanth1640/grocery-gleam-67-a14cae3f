import { createFileRoute } from "@tanstack/react-router";
import { VerifyRefundsView } from "@/components/refunds/VerifyRefundsView";

export const Route = createFileRoute("/_authenticated/outlet/refunds")({
  head: () => ({ meta: [{ title: "Refunds to verify — Outlet" }] }),
  component: () => <VerifyRefundsView />,
});
