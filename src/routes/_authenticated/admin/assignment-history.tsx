import { createFileRoute } from "@tanstack/react-router";
import { WarehouseHistoryBody } from "@/routes/_authenticated/warehouse.history";

export const Route = createFileRoute("/_authenticated/admin/assignment-history")({
  head: () => ({ meta: [{ title: "Assignment history — Admin" }] }),
  component: () => <WarehouseHistoryBody embedded />,
});
