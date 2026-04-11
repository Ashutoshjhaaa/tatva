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
      
      // Check if supabase client is available
      if (!supabase) {
        console.error("Supabase client is not initialized. Check your environment variables.");
        return null;
      }

      // Parse code: {book_code}-{section}-{chapter}-{shloka}
      const parts = code.split("-");
      if (parts.length < 3) return null;

      const bookCode = parts[0];
      const sectionNum = parseInt(parts[1]);
      const chapterNum = parseInt(parts[2]);

      try {
        // FIX 1: Only select columns that actually exist in the books table
        // Removed: has_translation_english, content_format (don't exist in DB)
        const { data: book, error: bookError } = await supabase
          .from("books")
          .select("id, name_english, name_hindi")
          .eq("code", bookCode)
          .single();

        if (bookError) {
          console.error("Error fetching book:", JSON.stringify(bookError, null, 2));
          return null;
        }
        if (!book) return null;

        // FIX 2: Use display_order instead of section_number (which doesn't exist in DB)
        // URL format bg-1-1-1: the "1" maps to display_order in the sections table
        const { data: section, error: sectionError } = await supabase
          .from("sections")
          .select("id, display_order, name_english, name_hindi")
          .eq("book_id", book.id)
          .eq("display_order", sectionNum)
          .single();

        if (sectionError) {
          console.error("Error fetching section:", JSON.stringify(sectionError, null, 2));
          return null;
        }
        if (!section) return null;

        // Get chapter — chapter_number exists, no change needed
        const { data: chapter, error: chapterError } = await supabase
          .from("chapters")
          .select("id, chapter_number, name_english, name_hindi, total_shlokas")
          .eq("section_id", section.id)
          .eq("chapter_number", chapterNum)
          .single();

        if (chapterError) {
          console.error("Error fetching chapter:", JSON.stringify(chapterError, null, 2));
          return null;
        }
        if (!chapter) return null;

        // Get shlokas — all these columns exist, no change needed
        const { data: shlokas, error: shlokasError } = await supabase
          .from("shlokas")
          .select("id, code, shloka_number, sanskrit, transliteration, translation_english, translation_hindi, is_highlighted")
          .eq("chapter_id", chapter.id)
          .order("shloka_number", { ascending: true });

        if (shlokasError) {
          console.error("Error fetching shlokas:", JSON.stringify(shlokasError, null, 2));
          return null;
        }

        // FIX 3: hasTranslation checks if any shloka has english translation
        // instead of the non-existent has_translation_english column on books
        const hasTranslation = (shlokas || []).some(s => !!s.translation_english);

        return {
          bookCode,
          bookName: book.name_english,
          bookNameHindi: book.name_hindi,
          sectionNumber: section.display_order ?? sectionNum,
          sectionName: section.name_english,
          sectionNameHindi: section.name_hindi,
          chapterNumber: chapter.chapter_number,
          chapterName: chapter.name_hindi || chapter.name_english || `अध्याय ${chapter.chapter_number}`,
          chapterNameHindi: chapter.name_hindi || `अध्याय ${chapter.chapter_number}`,
          totalShlokas: chapter.total_shlokas || shlokas?.length || 0,
          shlokas: (shlokas || []).map((s) => ({
            id: s.id,
            code: s.code,
            shloka_number: s.shloka_number,
            sanskrit: s.sanskrit,
            transliteration: s.transliteration,
            translation_english: s.translation_english,
            translation_hindi: s.translation_hindi,
            is_highlighted: s.is_highlighted,
          })),
          hasTranslation,
          contentFormat: "shloka",
        };
      } catch (err) {
        console.error("Error in useChapter:", err);
        return null;
      }
    },
    enabled: !!code,
  });
};