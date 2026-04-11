import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing env variables in .env.local", { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("---- Testing Books ----");
  const { data: books, error: booksErr } = await supabase.from('books').select('*');
  if (booksErr) console.log("BOOKS ERROR:", JSON.stringify(booksErr, null, 2));
  else console.log(`Found ${books.length} books:`, books);

  console.log("\n---- Testing Sections ----");
  const { data: sections, error: sectionsErr } = await supabase.from('sections').select('*');
  if (sectionsErr) console.log("SECTIONS ERROR:", JSON.stringify(sectionsErr, null, 2));
  else console.log(`Found ${sections.length} sections:`, sections);

  console.log("\n---- Testing Chapters ----");
  const { data: chapters, error: chaptersErr } = await supabase.from('chapters').select('*');
  if (chaptersErr) console.log("CHAPTERS ERROR:", JSON.stringify(chaptersErr, null, 2));
  else console.log(`Found ${chapters.length} chapters:`, chapters);

  console.log("\n---- Testing Shlokas ----");
  const { data: shlokas, error: shlokasErr } = await supabase.from('shlokas').select('*');
  if (shlokasErr) console.log("SHLOKAS ERROR:", JSON.stringify(shlokasErr, null, 2));
  else console.log(`Found ${shlokas.length} shlokas:`, shlokas.length > 0 ? shlokas[0] : "None");
}

test().catch(console.error);