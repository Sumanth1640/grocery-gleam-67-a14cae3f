import { createFileRoute } from "@tanstack/react-router";
import { VerifyRefundsView } from "@/components/refunds/VerifyRefundsView";

export const Route = createFileRoute("/_authenticated/admin/refunds-verify")({
  head: () => ({ meta: [{ title: "Refunds to verify — Warehouse" }] }),
  component: () => <VerifyRefundsView />,
});
