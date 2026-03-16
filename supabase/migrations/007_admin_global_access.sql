-- Allow administrators (global admins) to see records from all communities
-- to enable activity badges and cross-community management.

-- profiles
drop policy if exists "Profiles: ver perfiles de mi comunidad" on public.profiles;
create policy "Profiles: ver perfiles de mi comunidad y admin todas" on public.profiles for
select using (
    community_id = public.my_community_id()
    or id = auth.uid()
    or public.my_role() = 'admin'
);

-- incidents
drop policy if exists "Incidents: vecino ve solo las suyas; admin ve todas" on public.incidents;
create policy "Incidents: vecino ve solo las suyas; admin todas; president su comunidad" on public.incidents for
select using (
    created_by = auth.uid()
    or public.my_role() = 'admin'
    or (
      community_id = public.my_community_id()
      and public.my_role() = 'president'
    )
    or (
        community_id = public.my_community_id()
        and public.my_role() = 'admin' -- redundante pero seguro
    )
);

-- reservations
drop policy if exists "Reservations: vecino ve solo las suyas; admin ve todas" on public.reservations;
create policy "Reservations: acceso global admin; parcial president/vecino" on public.reservations for
select using (
    public.my_role() = 'admin'
    or (
      community_id = public.my_community_id()
      and (
        user_id = auth.uid()
        or public.my_role() in ('admin', 'president')
      )
    )
);

-- notices
drop policy if exists "Notices: ver de mi comunidad" on public.notices;
create policy "Notices: ver de mi comunidad o admin todas" on public.notices for
select using (
    community_id = public.my_community_id()
    or public.my_role() = 'admin'
);

-- docs
drop policy if exists "Docs: ver de mi comunidad" on public.docs;
create policy "Docs: ver todas para admin o de mi comunidad" on public.docs for
select using (
    community_id = public.my_community_id()
    or public.my_role() = 'admin'
);

-- spaces
drop policy if exists "Spaces: ver de mi comunidad" on public.spaces;
create policy "Spaces: ver todas para admin o de mi comunidad" on public.spaces for
select using (
    community_id = public.my_community_id()
    or public.my_role() = 'admin'
);
