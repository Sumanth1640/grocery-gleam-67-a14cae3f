-- Public buckets serve files by direct URL without needing a SELECT policy.
-- Removing this policy prevents listing the bucket while keeping image URLs viewable.
drop policy if exists "catalog_public_read" on storage.objects;
