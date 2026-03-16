-- Añade la columna NIF a la tabla communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS nif TEXT;
