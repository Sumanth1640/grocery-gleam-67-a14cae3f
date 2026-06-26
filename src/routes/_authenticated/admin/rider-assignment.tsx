import { createFileRoute } from "@tanstack/react-router";
import { WarehousePanelBody } from "@/routes/_authenticated/warehouse";

export const Route = createFileRoute("/_authenticated/admin/rider-assignment")({
  head: () => ({ meta: [{ title: "Rider assignment — Admin" }] }),
  component: () => <WarehousePanelBody embedded />,
});
