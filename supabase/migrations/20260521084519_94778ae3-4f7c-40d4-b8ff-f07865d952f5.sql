
-- Add onboarding columns
ALTER TABLE public.partner_restaurants
  ADD COLUMN IF NOT EXISTS owner_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS owner_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS owner_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fssai_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fssai_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fssai_expiry date,
  ADD COLUMN IF NOT EXISTS pan_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pan_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS gst_doc_url text,
  ADD COLUMN IF NOT EXISTS bank_account_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_account_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_ifsc text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_proof_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shop_license_doc_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS agreement_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS agreement_version text,
  ADD COLUMN IF NOT EXISTS agreement_signature text,
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 22,
  ADD COLUMN IF NOT EXISTS onboarding_step smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Private storage bucket for partner documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-docs', 'partner-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: owner can read/write their own folder ({user_id}/...)
DROP POLICY IF EXISTS "partner_docs_owner_read" ON storage.objects;
CREATE POLICY "partner_docs_owner_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'partner-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "partner_docs_owner_insert" ON storage.objects;
CREATE POLICY "partner_docs_owner_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'partner-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "partner_docs_owner_update" ON storage.objects;
CREATE POLICY "partner_docs_owner_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'partner-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "partner_docs_owner_delete" ON storage.objects;
CREATE POLICY "partner_docs_owner_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'partner-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can read all partner docs
DROP POLICY IF EXISTS "partner_docs_admin_read" ON storage.objects;
CREATE POLICY "partner_docs_admin_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'partner-docs' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Tighten public listing: require agreement
DROP POLICY IF EXISTS "partner_restaurants_public_read_approved" ON public.partner_restaurants;
CREATE POLICY "partner_restaurants_public_read_approved"
ON public.partner_restaurants FOR SELECT TO anon, authenticated
USING (status = 'approved' AND agreement_accepted_at IS NOT NULL);
