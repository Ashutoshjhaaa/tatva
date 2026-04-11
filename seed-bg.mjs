import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Missing Supabase variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Seeding Bhagavad Gita Section 1, Chapter 1 data for testing...");

  // 1. Insert Book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .upsert(
      { code: 'bg', name_english: 'Bhagavad Gita', name_hindi: 'भगवद्गीता' },
      { onConflict: 'code' }
    )
    .select()
    .single();
    
  if (bookError) throw new Error("Failed to insert book: " + JSON.stringify(bookError));

  // 2. Insert Section
  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .upsert(
      { book_id: book.id, code: 'bg-sec-1', name_english: 'Chapter 1-6', name_hindi: 'अध्याय १-६', display_order: 1 },
      { onConflict: 'code' }
    )
    .select()
    .single();

  if (sectionError) throw new Error("Failed to insert section: " + JSON.stringify(sectionError));

  // 3. Insert Chapter
  // Note: we can't upsert directly on multiple criteria easily without a unique constraint, but assuming it links by section_id/chapter_number
  const { data: chapterCheck } = await supabase
    .from('chapters')
    .select('id')
    .eq('section_id', section.id)
    .eq('chapter_number', 1)
    .maybeSingle();

  let chapter = chapterCheck;
  if (!chapter) {
    const { data: newChapter, error: chapterError } = await supabase
      .from('chapters')
      .insert({ section_id: section.id, chapter_number: 1, name_english: 'Arjuna Visada Yoga', name_hindi: 'अर्जुनविषादयोग', total_shlokas: 47 })
      .select()
      .single();
    if (chapterError) throw new Error("Failed to insert chapter: " + JSON.stringify(chapterError));
    chapter = newChapter;
  }

  // 4. Insert Shlokas
  const shlokasToInsert = [
    { code: 'bg-1-1-1', shloka_number: 1, sanskrit: 'धृतराष्ट्र उवाच |\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय || १ ||', transliteration: 'dhṛtarāṣṭra uvāca...\ndharmakṣetre kurukṣetre...', translation_english: 'Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?', translation_hindi: 'धृतराष्ट्र ने कहा: हे संजय! धर्मभूमि कुरुक्षेत्र में युद्ध की इच्छा से एकत्र हुए मेरे और पाण्डु के पुत्रों ने क्या किया?' },
    { code: 'bg-1-1-2', shloka_number: 2, sanskrit: 'सञ्जय उवाच |\nदृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा |\nआचार्यमुपसङ्गम्य राजा वचनमब्रवीत् || २ ||', transliteration: 'sañjaya uvāca...\ndṛṣṭvā tu pāṇḍavānīkaṃ...', translation_english: 'Sanjaya said: O King, after looking over the army gathered by the sons of Pandu, King Duryodhana went to his teacher and began to speak the following words.', translation_hindi: 'संजय ने कहा: हे राजन्! पाण्डुपुत्रों द्वारा सेना की व्यूहरचना देखकर राजा दुर्योधन अपने गुरु के पास गये और यह वचन बोले।' },
  ];

  for (const s of shlokasToInsert) {
    const { error: shlokaError } = await supabase
      .from('shlokas')
      .upsert(
        { chapter_id: chapter.id, ...s },
        { onConflict: 'code' }
      );
    if (shlokaError) console.error("Warning inserting shloka " + s.code, shlokaError);
  }

  console.log("✅ Successfully seeded test Bhagavad Gita data!");
}

seed().catch(console.error);