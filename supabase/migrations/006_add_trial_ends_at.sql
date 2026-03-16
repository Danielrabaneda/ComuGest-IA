-- Añadir fecha de fin de prueba a las comunidades
alter table public.communities 
add column if not exists trial_ends_at timestamptz;

-- Comentario explicativo
comment on column public.communities.trial_ends_at is 'Fecha en la que termina el periodo de prueba de 30 días';
