-- Public storage bucket for catalog images (categories + products)
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;

-- Public read for the bucket
create policy "catalog_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'catalog');

-- Admins can write/update/delete in the bucket
create policy "catalog_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalog' and public.has_role(auth.uid(), 'admin'));

create policy "catalog_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalog' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'catalog' and public.has_role(auth.uid(), 'admin'));

create policy "catalog_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalog' and public.has_role(auth.uid(), 'admin'));
