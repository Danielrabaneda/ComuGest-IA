-- ============================================================
-- Migración para soportar un futuro sistema RAG con pgvector
-- ============================================================

-- 1. Habilitar la extensión vectorial en PostgreSQL
create extension if not exists vector;

-- 2. Crear una tabla para almacenar los fragmentos de texto con su representación matemática (embeddings)
create table if not exists public.doc_chunks (
    id bigint primary key generated always as identity,
    community_id uuid references public.communities(id) on delete cascade,
    doc_id uuid references public.docs(id) on delete cascade, -- Enlace opcional a un documento origen
    title text,
    content text not null,
    embedding vector(1536), -- 1536 dimensiones es el estándar usado por los modelos text-embedding de OpenAI
    created_at timestamptz not null default now()
);

-- 3. Crear una función de "Búsqueda por Similitud" (Cosine Similarity search)
-- Esta es la función mágica que usará el Agente IA en el futuro para encontrar los párrafos correctos
create or replace function public.match_doc_chunks (
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_community_id uuid
)
returns table (
    id bigint,
    title text,
    content text,
    similarity float
)
language sql stable
as $$
select
    doc_chunks.id,
    doc_chunks.title,
    doc_chunks.content,
    1 - (doc_chunks.embedding <=> query_embedding) as similarity -- <=> es el operador de distancia del coseno
from public.doc_chunks
where doc_chunks.community_id = p_community_id
  -- Solo devolvemos los que coinciden por encima de cierto porcentaje (threshold)
  and 1 - (doc_chunks.embedding <=> query_embedding) > match_threshold
order by doc_chunks.embedding <=> query_embedding
limit match_count;
$$;

-- 4. Habilitar la Seguridad a nivel de Fila (RLS) para proteger los fragmentos
alter table public.doc_chunks enable row level security;

create policy "Doc Chunks: leer de mi comunidad" on public.doc_chunks for
select using (community_id = public.my_community_id());

create policy "Doc Chunks: insertar solo admin" on public.doc_chunks for
insert with check (
    community_id = public.my_community_id()
    and public.my_role() in ('admin', 'president')
);

create policy "Doc Chunks: gestionar solo admin" on public.doc_chunks for
update using (
    community_id = public.my_community_id()
    and public.my_role() in ('admin', 'president')
);
create policy "Doc Chunks: eliminar solo admin" on public.doc_chunks for
delete using (
    community_id = public.my_community_id()
    and public.my_role() in ('admin', 'president')
);
