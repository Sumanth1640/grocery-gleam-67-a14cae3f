# Swiggy-style Partner Onboarding

Rebuild the partner profile page as a 5-step wizard that mirrors Swiggy's flow, with document uploads, an agreement step, and admin verification before going live.

## 1. Database changes

Add to `partner_restaurants`:
- `owner_name text`, `owner_email text`, `owner_phone text`
- `fssai_number text`, `fssai_doc_url text`, `fssai_expiry date`
- `pan_number text`, `pan_doc_url text`
- `gst_number text` (nullable), `gst_doc_url text` (nullable)
- `bank_account_name text`, `bank_account_number text`, `bank_ifsc text`, `bank_proof_url text`
- `shop_license_doc_url text`
- `agreement_accepted_at timestamptz`, `agreement_version text`
- `commission_rate numeric` (admin sets; default 22)
- `onboarding_step smallint` default 1 (1=basics, 2=docs, 3=menu, 4=agreement, 5=submitted)
- `rejection_reason text` (admin)

Status flow stays: `pending → approved | rejected`. Restaurant only appears publicly when `status='approved'` AND `is_open=true` AND `agreement_accepted_at IS NOT NULL`.

## 2. Storage

New **private** bucket `partner-docs` (FSSAI, PAN, GST, bank, shop license are sensitive — NOT public).
- RLS: owner can upload/read their own folder (`{user_id}/...`); admins can read all; no public access.
- Signed URLs generated server-side for admin viewing.

## 3. Server functions (`src/lib/partner.functions.ts`)

- Split `updateMyRestaurant` into step-specific helpers: `saveBasics`, `saveDocuments`, `acceptAgreement`, `submitForReview`.
- `submitForReview` validates all required fields/docs present, then sets `status='pending'` + `onboarding_step=5`.
- Admin: `adminSetRestaurantStatus` already exists — extend with `commission_rate` and `rejection_reason`. Add `adminGetDocSignedUrl(path)`.

## 4. Partner UI — wizard at `/partner/profile`

Replace the flat form with a stepper:
1. **Basics** — name, slug (live uniqueness check), owner name/email/phone, area, cuisines, logo, cover, ETA, cost for two, timings.
2. **Documents** — FSSAI (number + file + expiry), PAN (number + file), GST (optional), bank details (account/IFSC + cancelled cheque), shop license file.
3. **Menu** — link to existing `/partner/menu`; require at least 1 dish to proceed.
4. **Agreement** — show commission range (18–30%), terms, "I agree" checkbox + signature name. Stores `agreement_accepted_at`.
5. **Submit for review** — summary screen + submit button. Locks the record into `pending`.

Each step saves independently so partners can resume. Progress bar at top. Dashboard shows current step + next action.

## 5. Admin UI — `/admin/restaurants`

Extend approval queue:
- Show all submitted documents (signed URL links open in new tab).
- Input for `commission_rate` and optional `rejection_reason`.
- Approve / Reject buttons; rejection sends a notification with reason and sets `status='rejected'` so partner can edit + resubmit.

## 6. Public visibility

Update `partner-public.functions.ts` to filter `agreement_accepted_at IS NOT NULL` in addition to `status='approved'`.

## Technical notes
- Document files: PDF/JPG/PNG, max 5MB each, stored under `partner-docs/{owner_id}/{type}-{timestamp}.{ext}`.
- Build a small `<DocumentUpload>` component (variant of `ImageUpload`) targeting the private bucket.
- Slug uniqueness check (from previous turn) folds into Step 1.
- Zod schemas per step on the server; client-side same schema for inline errors.

## Out of scope (flag for later)
- E-signature integration (DocuSign etc.) — using checkbox + typed name for now.
- Automated FSSAI verification API — admin manually verifies.
- Commission negotiation chat — admin sets one rate.

## Heads-up
Per your project memory: final app is targeted for PHP on Hostinger. This adds substantial React/TS surface area that will need porting. Confirm you still want it built here.