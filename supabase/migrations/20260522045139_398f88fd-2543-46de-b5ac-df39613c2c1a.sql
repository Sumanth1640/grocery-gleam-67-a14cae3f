ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- Allow users to cancel their own orders while still 'placed'
CREATE POLICY orders_cancel_own ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'placed')
  WITH CHECK (auth.uid() = user_id AND status IN ('placed','cancelled'));