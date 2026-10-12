-- ==============================================================================
-- Tatva: Zero-API-Key Scripture Search Engine Setup
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Enable pg_trgm for fuzzy and substring search
create extension if not exists pg_trgm;

-- 2. Create indexes for fast retrieval across languages
create index if not exists idx_shlokas_english_trgm on shlokas using gin (translation_english gin_trgm_ops);
create index if not exists idx_shlokas_hindi_trgm on shlokas using gin (translation_hindi gin_trgm_ops);
create index if not exists idx_shlokas_sanskrit_trgm on shlokas using gin (sanskrit gin_trgm_ops);
create index if not exists idx_shlokas_code_trgm on shlokas using gin (code gin_trgm_ops);

-- 3. Universal Scripture Search RPC Function
create or replace function search_scripture_shlokas(
  search_query text,
  target_book_code text default null,
  result_limit int default 5
)
returns table (
  id uuid,
  code text,
  shloka_number int,
  sanskrit text,
  transliteration text,
  translation_english text,
  translation_hindi text,
  chapter_name_english text,
  chapter_name_hindi text,
  chapter_number int,
  book_name_english text,
  book_name_hindi text,
  book_code text,
  score float
)
language plpgsql
as $$
declare
  cleaned_query text := trim(search_query);
begin
  return query
  select
    s.id,
    s.code,
    s.shloka_number,
    s.sanskrit,
    s.transliteration,
    s.translation_english,
    s.translation_hindi,
    c.name_english as chapter_name_english,
    c.name_hindi as chapter_name_hindi,
    c.chapter_number,
    b.name_english as book_name_english,
    b.name_hindi as book_name_hindi,
    b.code as book_code,
    (
      -- Exact code match gets highest score
      (case when s.code ilike '%' || cleaned_query || '%' then 15.0 else 0.0 end) +
      -- Exact shloka number match if query is numeric
      (case when cleaned_query ~ '^[0-9]+$' and s.shloka_number = cleaned_query::int then 5.0 else 0.0 end) +
      -- Hindi translation match
      (case when s.translation_hindi ilike '%' || cleaned_query || '%' then 8.0 else 0.0 end) +
      -- English translation match
      (case when s.translation_english ilike '%' || cleaned_query || '%' then 7.0 else 0.0 end) +
      -- Sanskrit verse match
      (case when s.sanskrit ilike '%' || cleaned_query || '%' then 9.0 else 0.0 end) +
      -- Transliteration match
      (case when s.transliteration ilike '%' || cleaned_query || '%' then 6.0 else 0.0 end) +
      -- Trigram similarity bonus
      similarity(coalesce(s.sanskrit, ''), cleaned_query) * 4.0 +
      similarity(coalesce(s.translation_english, ''), cleaned_query) * 3.0
    )::float as score
  from shlokas s
  left join chapters c on s.chapter_id = c.id
  left join sections sec on c.section_id = sec.id
  left join books b on sec.book_id = b.id
  where (
    s.code ilike '%' || cleaned_query || '%'
    or s.translation_english ilike '%' || cleaned_query || '%'
    or s.translation_hindi ilike '%' || cleaned_query || '%'
    or s.sanskrit ilike '%' || cleaned_query || '%'
    or s.transliteration ilike '%' || cleaned_query || '%'
  )
  and (target_book_code is null or b.code = target_book_code)
  order by score desc
  limit result_limit;
end;
$$;
