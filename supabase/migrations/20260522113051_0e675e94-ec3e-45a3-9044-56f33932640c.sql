ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);