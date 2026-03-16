// 1. Añade las columnas que puedan faltar en la tabla spaces
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS max_capacity int default 10;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS opening_time time default '09:00:00';
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS closing_time time default '22:00:00';
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS reservation_duration int default 60;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS available_days text[] default array['L', 'M', 'X', 'J', 'V', 'S', 'D']::text[];
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS description text;

NOTIFY pgrst, 'reload schema';
