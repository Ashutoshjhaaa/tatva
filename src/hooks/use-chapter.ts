import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Shloka {
  id: string;
  code: string;
  shloka_number: number;
  sanskrit: string | null;
  transliteration: string | null;
  translation_english: string | null;
  translation_hindi: string | null;
  is_highlighted: boolean;
}

export interface ChapterData {
  bookCode: string;
  bookName: string;
  bookNameHindi: string;
  sectionNumber: number;
  sectionName: string;
  sectionNameHindi: string;
  chapterNumber: number;
  chapterName: string;
  chapterNameHindi: string;
  totalShlokas: number;
  shlokas: Shloka[];
  hasTranslation: boolean;
  contentFormat: string;
}

export const useChapter = (code: string | undefined) => {
  return useQuery({
    queryKey: ["chapter", code],
    queryFn: async (): Promise<ChapterData | null> => {
      if (!code) return null;

      if (!supabase) {
        console.error("Supabase client is not initialized.");
        return null;
      }

      // Parse code: {book_code}-{section}-{chapter}  e.g. "rm-1-1" or "rm-1-1-1"
      const parts = code.split("-");
      if (parts.length < 3) {
        console.error(`Invalid code format: "${code}". Expected at least 3 parts.`);
        return null;
      }

      // For codes like "rm-1-1-1" bookCode="rm", sectionNum=1, chapterNum=1
      // For codes like "bg-1-1"   bookCode="bg", sectionNum=1, chapterNum=1
      const bookCode   = parts[0];
      const sectionNum = parseInt(parts[1]);
      const chapterNum = parseInt(parts[2]);

      console.log(`[useChapter] Parsed → bookCode="${bookCode}" section=${sectionNum} chapter=${chapterNum}`);

      try {
        // ── 1. Book ────────────────────────────────────────────────────────
        // Use maybeSingle() so 0 rows returns null instead of throwing PGRST116
        const { data: book, error: bookError } = await supabase
          .from("books")
          .select("id, code, name_english, name_hindi")
          .eq("code", bookCode)
          .maybeSingle();                          // ← KEY FIX

        if (bookError) {
          console.error("Error fetching book:", bookError.message);
          return null;
        }
        if (!book) {
          console.error(`No book found with code="${bookCode}". Check your books table.`);
          return null;
        }

        // ── 2. Section ─────────────────────────────────────────────────────
        const { data: section, error: sectionError } = await supabase
          .from("sections")
          .select("id, display_order, name_english, name_hindi")
          .eq("book_id", book.id)
          .eq("display_order", sectionNum)
          .maybeSingle();                          // ← KEY FIX

        if (sectionError) {
          console.error("Error fetching section:", sectionError.message);
          return null;
        }
        if (!section) {
          console.error(`No section found with book_id=${book.id} display_order=${sectionNum}.`);
          return null;
        }

        // ── 3. Chapter ─────────────────────────────────────────────────────
        const { data: chapter, error: chapterError } = await supabase
          .from("chapters")
          .select("id, chapter_number, name_english, name_hindi, total_shlokas")
          .eq("section_id", section.id)
          .eq("chapter_number", chapterNum)
          .maybeSingle();                          // ← KEY FIX

        if (chapterError) {
          console.error("Error fetching chapter:", chapterError.message);
          return null;
        }
        if (!chapter) {
          console.error(`No chapter found with section_id=${section.id} chapter_number=${chapterNum}.`);
          return null;
        }

        // ── 4. Shlokas ─────────────────────────────────────────────────────
        const { data: shlokas, error: shlokasError } = await supabase
          .from("shlokas")
          .select(
            "id, code, shloka_number, sanskrit, transliteration, translation_english, translation_hindi, is_highlighted"
          )
          .eq("chapter_id", chapter.id)
          .order("display_order", { ascending: true });  // use display_order for correct ordering

        if (shlokasError) {
          console.error("Error fetching shlokas:", shlokasError.message);
          return null;
        }

        const hasTranslation = (shlokas || []).some((s) => !!s.translation_english);

        return {
          bookCode,
          bookName:        book.name_english,
          bookNameHindi:   book.name_hindi,
          sectionNumber:   section.display_order ?? sectionNum,
          sectionName:     section.name_english,
          sectionNameHindi: section.name_hindi,
          chapterNumber:   chapter.chapter_number,
          chapterName:     chapter.name_hindi || chapter.name_english || `अध्याय ${chapter.chapter_number}`,
          chapterNameHindi: chapter.name_hindi || `अध्याय ${chapter.chapter_number}`,
          totalShlokas:    chapter.total_shlokas || shlokas?.length || 0,
          shlokas: (shlokas || []).map((s) => ({
            id:                  s.id,
            code:                s.code,
            shloka_number:       s.shloka_number,
            sanskrit:            s.sanskrit,
            transliteration:     s.transliteration,
            translation_english: s.translation_english,
            translation_hindi:   s.translation_hindi,
            is_highlighted:      s.is_highlighted,
          })),
          hasTranslation,
          contentFormat: "shloka",
        };
      } catch (err) {
        console.error("Unexpected error in useChapter:", err);
        return null;
      }
    },
    enabled: !!code,
  });
};