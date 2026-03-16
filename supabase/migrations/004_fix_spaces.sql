-- Añade la columna de días disponibles a espacios
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS available_days text[] default array['L', 'M', 'X', 'J', 'V', 'S', 'D']::text[];

-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('space-images', 'space-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Crear políticas para el bucket
CREATE POLICY "Public Access space images" ON storage.objects FOR SELECT USING (bucket_id = 'space-images');
CREATE POLICY "Auth Insert space images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'space-images');
CREATE POLICY "Auth Update space images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'space-images');
CREATE POLICY "Auth Delete space images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'space-images');

-- Refrescar caché
NOTIFY pgrst, 'reload schema';
