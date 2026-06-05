
-- Add verification step to refund requests (manager verifies, admin then refunds)
ALTER TABLE public.refund_requests
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verifier_note text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_refund_verification ON public.refund_requests(verification_status, created_at DESC);

-- Allow warehouse managers to read refunds for orders shipped from their warehouse
CREATE POLICY "wh_mgr_read_refunds"
ON public.refund_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = refund_requests.order_id
      AND o.warehouse_id IS NOT NULL
      AND public.manages_warehouse(auth.uid(), o.warehouse_id)
  )
);

-- Allow warehouse managers to update verification fields (RLS scope: any UPDATE check is by scope only).
CREATE POLICY "wh_mgr_verify_refunds"
ON public.refund_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = refund_requests.order_id
      AND o.warehouse_id IS NOT NULL
      AND public.manages_warehouse(auth.uid(), o.warehouse_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = refund_requests.order_id
      AND o.warehouse_id IS NOT NULL
      AND public.manages_warehouse(auth.uid(), o.warehouse_id)
  )
);

-- Allow outlet managers to read refunds for orders from their outlet
CREATE POLICY "outlet_mgr_read_refunds"
ON public.refund_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = refund_requests.order_id
      AND o.outlet_id IS NOT NULL
      AND public.manages_outlet(auth.uid(), o.outlet_id)
  )
);

CREATE POLICY "outlet_mgr_verify_refunds"
ON public.refund_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = refund_requests.order_id
      AND o.outlet_id IS NOT NULL
      AND public.manages_outlet(auth.uid(), o.outlet_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = refund_requests.order_id
      AND o.outlet_id IS NOT NULL
      AND public.manages_outlet(auth.uid(), o.outlet_id)
  )
);
