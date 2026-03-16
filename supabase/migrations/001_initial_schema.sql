-- ============================================================
-- ComuGest IA — Migración completa del schema
-- Ejecutar en Supabase SQL Editor o con supabase db push
-- ============================================================
-- ===================
-- EXTENSIONES
-- ===================
create extension if not exists "uuid-ossp";
-- ===================
-- TABLA: communities
-- ===================
create table if not exists public.communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  code text unique not null,
  plan text not null default 'basic' check (plan in ('basic', 'pro', 'admin')),
  subscription_status text not null default 'trial' check (
    subscription_status in ('active', 'trial', 'paused', 'cancelled')
  ),
  created_at timestamptz not null default now()
);
-- ===================
-- TABLA: profiles
-- ===================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  community_id uuid references public.communities(id) on delete
  set null,
    full_name text,
    email text,
    phone text,
    role text not null default 'neighbor' check (role in ('neighbor', 'admin', 'president')),
    unit text,
    avatar_url text,
    status text not null default 'active' check (status in ('pending', 'active', 'suspended')),
    created_at timestamptz not null default now()
);
-- ===================
-- TABLA: incidents
-- ===================
create table if not exists public.incidents (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'other' check (
    category in (
      'elevator',
      'garage',
      'cleaning',
      'noise',
      'other'
    )
  ),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- ===================
-- TABLA: incident_attachments
-- ===================
create table if not exists public.incident_attachments (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  file_url text not null,
  file_type text not null default 'other' check (file_type in ('image', 'video', 'other')),
  created_at timestamptz not null default now()
);
-- ===================
-- TABLA: incident_comments
-- ===================
create table if not exists public.incident_comments (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);
-- ===================
-- TABLA: notices
-- ===================
create table if not exists public.notices (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  short_body text,
  type text not null default 'general' check (
    type in (
      'general',
      'meeting',
      'maintenance',
      'cleaning',
      'works'
    )
  ),
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);
-- ===================
-- TABLA: spaces
-- ===================
create table if not exists public.spaces (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  rules text,
  opening_time time not null default '09:00:00',
  closing_time time not null default '22:00:00',
  reservation_duration integer not null default 60,
  max_capacity integer not null default 10,
  available_days text [] default array ['L', 'M', 'X', 'J', 'V', 'S', 'D']::text [],
  created_at timestamptz not null default now()
);
-- ===================
-- TABLA: reservations
-- ===================
create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  -- Placeholder para futuras limitaciones por usuario
  notes text,
  constraint no_time_overlap exclude using gist (
    space_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  )
  where (status = 'confirmed')
);
-- Activar extensión btree_gist para el constraint de exclusión
create extension if not exists btree_gist;
-- ===================
-- TABLA: docs (FAQ / Normas)
-- ===================
create table if not exists public.docs (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'other' check (type in ('rules', 'payment', 'other')),
  created_at timestamptz not null default now()
);
-- ===================
-- TABLA: ai_sessions
-- ===================
create table if not exists public.ai_sessions (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- ======================================================
-- TRIGGER: updated_at automático
-- ======================================================
create or replace function public.handle_updated_at() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
create trigger incidents_updated_at before
update on public.incidents for each row execute function public.handle_updated_at();
create trigger ai_sessions_updated_at before
update on public.ai_sessions for each row execute function public.handle_updated_at();
-- ======================================================
-- TRIGGER: crear profile automáticamente al registrar
-- ======================================================
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, email, full_name)
values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
after
insert on auth.users for each row execute function public.handle_new_user();
-- ======================================================
-- FUNCIÓN: validar no solapamiento de reservas (backup)
-- ======================================================
create or replace function public.check_reservation_overlap(
    p_space_id uuid,
    p_start timestamptz,
    p_end timestamptz,
    p_exclude_id uuid default null
  ) returns boolean as $$
select exists (
    select 1
    from public.reservations
    where space_id = p_space_id
      and status = 'confirmed'
      and (
        p_exclude_id is null
        or id != p_exclude_id
      )
      and (start_time, end_time) overlaps (p_start, p_end)
  );
$$ language sql stable;
-- ======================================================
-- ROW LEVEL SECURITY (RLS)
-- ======================================================
-- Habilitar RLS en todas las tablas
alter table public.communities enable row level security;
alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_attachments enable row level security;
alter table public.incident_comments enable row level security;
alter table public.notices enable row level security;
alter table public.spaces enable row level security;
alter table public.reservations enable row level security;
alter table public.docs enable row level security;
alter table public.ai_sessions enable row level security;
-- ---- Helper: community_id del usuario actual ----
create or replace function public.my_community_id() returns uuid as $$
select community_id
from public.profiles
where id = auth.uid()
  and status = 'active';
$$ language sql stable security definer;
-- ---- Helper: role del usuario actual ----
create or replace function public.my_role() returns text as $$
select role
from public.profiles
where id = auth.uid();
$$ language sql stable security definer;
-- ---- communities ----
create policy "Community: ver todas (para onboarding/unirse)" on public.communities for
select using (true);
create policy "Community: insertar (anon para onboarding)" on public.communities for
insert with check (true);
create policy "Community: editar solo admin/president" on public.communities for
update using (
    id = public.my_community_id()
    and public.my_role() in ('admin', 'president')
  );
-- ---- profiles ----
create policy "Profiles: ver perfiles de mi comunidad" on public.profiles for
select using (
    community_id = public.my_community_id()
    or id = auth.uid()
  );
create policy "Profiles: insertar propio" on public.profiles for
insert with check (id = auth.uid());
create policy "Profiles: editar propio o admin" on public.profiles for
update using (
    id = auth.uid()
    or (
      community_id = public.my_community_id()
      and public.my_role() in ('admin', 'president')
    )
  );
-- ---- incidents ----
create policy "Incidents: vecino ve solo las suyas; admin ve todas" on public.incidents for
select using (
    created_by = auth.uid()
    or (
      community_id = public.my_community_id()
      and public.my_role() in ('admin', 'president')
    )
  );
create policy "Incidents: cualquier vecino de la comunidad puede crear" on public.incidents for
insert with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and community_id = public.incidents.community_id
    )
  );
create policy "Incidents: admin puede actualizar todas; vecino solo las suyas" on public.incidents for
update using (
    community_id = public.my_community_id()
    and (
      created_by = auth.uid()
      or public.my_role() in ('admin', 'president')
    )
  );
-- ---- incident_attachments ----
create policy "IncidentAttachments: ver si puedo ver la incidencia" on public.incident_attachments for
select using (
    exists (
      select 1
      from public.incidents i
      where i.id = incident_id
        and (
          i.created_by = auth.uid()
          or (
            i.community_id = public.my_community_id()
            and public.my_role() in ('admin', 'president')
          )
        )
    )
  );
create policy "IncidentAttachments: insertar en mis incidencias" on public.incident_attachments for
insert with check (
    exists (
      select 1
      from public.incidents i
      where i.id = incident_id
        and i.created_by = auth.uid()
    )
  );
-- ---- incident_comments ----
create policy "IncidentComments: ver si puedo ver la incidencia" on public.incident_comments for
select using (
    exists (
      select 1
      from public.incidents i
      where i.id = incident_id
        and (
          i.created_by = auth.uid()
          or (
            i.community_id = public.my_community_id()
            and public.my_role() in ('admin', 'president')
          )
        )
    )
  );
create policy "IncidentComments: insertar en incidencias accesibles" on public.incident_comments for
insert with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.incidents i
      where i.id = incident_id
        and i.community_id = public.my_community_id()
        and (
          i.created_by = auth.uid()
          or public.my_role() in ('admin', 'president')
        )
    )
  );
-- ---- notices ----
create policy "Notices: ver de mi comunidad" on public.notices for
select using (community_id = public.my_community_id());
create policy "Notices: crear solo admin/president" on public.notices for
insert with check (
    community_id = public.my_community_id()
    and public.my_role() in ('admin', 'president')
  );
create policy "Notices: editar solo admin/president" on public.notices for
update using (
    community_id = public.my_community_id()
    and public.my_role() in ('admin', 'president')
  );
create policy "Notices: borrar solo admin/president" on public.notices for delete using (
  community_id = public.my_community_id()
  and public.my_role() in ('admin', 'president')
);
-- ---- spaces ----
create policy "Spaces: ver de mi comunidad" on public.spaces for
select using (community_id = public.my_community_id());
create policy "Spaces: gestionar solo admin/president" on public.spaces for all using (
  community_id = public.my_community_id()
  and public.my_role() in ('admin', 'president')
);
-- ---- reservations ----
create policy "Reservations: vecino ve solo las suyas; admin ve todas" on public.reservations for
select using (
    community_id = public.my_community_id()
    and (
      user_id = auth.uid()
      or public.my_role() in ('admin', 'president')
    )
  );
create policy "Reservations: vecino puede crear" on public.reservations for
insert with check (
    community_id = public.my_community_id()
    and user_id = auth.uid()
  );
create policy "Reservations: vecino cancela las suyas; admin gestiona todas" on public.reservations for
update using (
    community_id = public.my_community_id()
    and (
      user_id = auth.uid()
      or public.my_role() in ('admin', 'president')
    )
  );
-- ---- docs ----
create policy "Docs: ver de mi comunidad" on public.docs for
select using (community_id = public.my_community_id());
create policy "Docs: gestionar solo admin/president" on public.docs for all using (
  community_id = public.my_community_id()
  and public.my_role() in ('admin', 'president')
);
-- ---- ai_sessions ----
create policy "AiSessions: ver solo las propias; admin ve todas" on public.ai_sessions for
select using (
    community_id = public.my_community_id()
    and (
      user_id = auth.uid()
      or public.my_role() in ('admin', 'president')
    )
  );
create policy "AiSessions: crear propias" on public.ai_sessions for
insert with check (
    community_id = public.my_community_id()
    and user_id = auth.uid()
  );
create policy "AiSessions: actualizar propias" on public.ai_sessions for
update using (user_id = auth.uid());
-- ======================================================
-- Storage: bucket para adjuntos de incidencias
-- ======================================================
insert into storage.buckets (id, name, public)
values (
    'incident-attachments',
    'incident-attachments',
    true
  ) on conflict (id) do nothing;
create policy "Incident attachments: upload autenticado" on storage.objects for
insert with check (
    bucket_id = 'incident-attachments'
    and auth.role() = 'authenticated'
  );
create policy "Incident attachments: leer de mi comunidad" on storage.objects for
select using (
    bucket_id = 'incident-attachments'
    and auth.role() = 'authenticated'
  );
-- ======================================================
-- Storage: bucket para imágenes de espacios
-- ======================================================
insert into storage.buckets (id, name, public)
values (
    'space-images',
    'space-images',
    true
  ) on conflict (id) do nothing;
create policy "Space images: upload autenticado" on storage.objects for
insert with check (
    bucket_id = 'space-images'
    and auth.role() = 'authenticated'
  );
create policy "Space images: leer de mi comunidad" on storage.objects for
select using (
    bucket_id = 'space-images'
    and auth.role() = 'authenticated'
  );