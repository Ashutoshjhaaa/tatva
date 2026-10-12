import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseUserQuery } from "@/lib/query-parser";
import { synthesizeScriptureResponse, ShlokaSearchResult } from "@/lib/response-synthesizer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { messages, bookFilter } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = (lastMessage.content || "").trim();

    if (!userQuery) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }

    // 1. Natural Language Intent & Concept Parsing (Zero-API)
    const parsed = parseUserQuery(userQuery);

    // Apply book filter if selected from UI
    if (bookFilter && bookFilter !== "all") {
      parsed.bookCode = bookFilter;
    }

    // Quick return for greetings or help intents without querying database
    if (parsed.intent === "GREETING" || parsed.intent === "HELP") {
      const immediateResponse = synthesizeScriptureResponse(parsed, []);
      return NextResponse.json({
        role: "assistant",
        content: immediateResponse.content,
        citations: immediateResponse.citations,
        suggestedFollowUps: immediateResponse.suggestedFollowUps,
      });
    }

    let results: ShlokaSearchResult[] = [];

    // 2. Direct Verse Lookup by exact code (e.g. "bg-1-1-1")
    if (parsed.explicitVerseCode) {
      const { data } = await supabase
        .from("shlokas")
        .select(`
          id, code, shloka_number, sanskrit, transliteration, translation_english, translation_hindi,
          chapters ( name_english, name_hindi, chapter_number, sections ( books ( name_english, name_hindi, code ) ) )
        `)
        .eq("code", parsed.explicitVerseCode)
        .limit(1);

      if (data && data.length > 0) {
        const item: any = data[0];
        results.push({
          id: item.id,
          code: item.code,
          shloka_number: item.shloka_number,
          sanskrit: item.sanskrit,
          transliteration: item.transliteration,
          translation_english: item.translation_english,
          translation_hindi: item.translation_hindi,
          chapter_name_english: item.chapters?.name_english,
          chapter_name_hindi: item.chapters?.name_hindi,
          chapter_number: item.chapters?.chapter_number,
          book_name_english: item.chapters?.sections?.books?.name_english,
          book_name_hindi: item.chapters?.sections?.books?.name_hindi,
          book_code: item.chapters?.sections?.books?.code,
          score: 100,
        });
      }
    }

    // 3. Direct Verse Lookup by Chapter & Shloka Number (e.g. "Gita 2.47")
    if (results.length === 0 && parsed.chapterNumber && parsed.shlokaNumber) {
      const query = supabase
        .from("shlokas")
        .select(`
          id, code, shloka_number, sanskrit, transliteration, translation_english, translation_hindi,
          chapters!inner ( name_english, name_hindi, chapter_number, sections!inner ( books!inner ( name_english, name_hindi, code ) ) )
        `)
        .eq("shloka_number", parsed.shlokaNumber)
        .eq("chapters.chapter_number", parsed.chapterNumber);

      if (parsed.bookCode) {
        query.eq("chapters.sections.books.code", parsed.bookCode);
      }

      const { data } = await query.limit(1);
      if (data && data.length > 0) {
        const item: any = data[0];
        results.push({
          id: item.id,
          code: item.code,
          shloka_number: item.shloka_number,
          sanskrit: item.sanskrit,
          transliteration: item.transliteration,
          translation_english: item.translation_english,
          translation_hindi: item.translation_hindi,
          chapter_name_english: item.chapters?.name_english,
          chapter_name_hindi: item.chapters?.name_hindi,
          chapter_number: item.chapters?.chapter_number,
          book_name_english: item.chapters?.sections?.books?.name_english,
          book_name_hindi: item.chapters?.sections?.books?.name_hindi,
          book_code: item.chapters?.sections?.books?.code,
          score: 90,
        });
      }
    }

    // 4. Try Database Universal RPC Search (`search_scripture_shlokas`)
    if (results.length === 0) {
      const searchQuery = parsed.searchKeywords.join(" ") || userQuery;
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc("search_scripture_shlokas", {
          search_query: searchQuery,
          target_book_code: parsed.bookCode || null,
          result_limit: 4,
        });

        if (!rpcErr && rpcData && rpcData.length > 0) {
          results = rpcData;
        }
      } catch (err) {
        console.warn("RPC function search_scripture_shlokas not available yet, falling back to direct table search.");
      }
    }

    // 5. Fallback: Direct Table ILike Search across Translations & Sanskrit
    if (results.length === 0) {
      const keywords = parsed.searchKeywords.length > 0 ? parsed.searchKeywords : [userQuery];
      const primaryWord = keywords[0];

      let query = supabase
        .from("shlokas")
        .select(`
          id, code, shloka_number, sanskrit, transliteration, translation_english, translation_hindi,
          chapters ( name_english, name_hindi, chapter_number, sections ( books ( name_english, name_hindi, code ) ) )
        `)
        .or(
          `translation_hindi.ilike.%${primaryWord}%,translation_english.ilike.%${primaryWord}%,sanskrit.ilike.%${primaryWord}%`
        )
        .limit(4);

      const { data: fallbackData } = await query;
      if (fallbackData && fallbackData.length > 0) {
        results = fallbackData.map((item: any) => ({
          id: item.id,
          code: item.code,
          shloka_number: item.shloka_number,
          sanskrit: item.sanskrit,
          transliteration: item.transliteration,
          translation_english: item.translation_english,
          translation_hindi: item.translation_hindi,
          chapter_name_english: item.chapters?.name_english,
          chapter_name_hindi: item.chapters?.name_hindi,
          chapter_number: item.chapters?.chapter_number,
          book_name_english: item.chapters?.sections?.books?.name_english,
          book_name_hindi: item.chapters?.sections?.books?.name_hindi,
          book_code: item.chapters?.sections?.books?.code,
          score: 50,
        }));
      }
    }

    // 6. Multi-Language AI Generation (via Gemini if key provided, with Zero-API local fallback)
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && results.length > 0) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const scriptureContext = results.map((s, idx) => `
[Passage ${idx + 1}]
- Scripture: ${s.book_name_english || s.book_name_hindi || "Ancient Scripture"}
- Chapter: ${s.chapter_name_english || s.chapter_name_hindi || ""} (Verse ${s.shloka_number})
- Code: ${s.code}
- Sanskrit: ${s.sanskrit || ""}
- English Meaning: ${s.translation_english || "N/A"}
- Hindi Meaning: ${s.translation_hindi || "N/A"}
`).join("\n");

        const promptInstruction = `You are 'तत्त्व दर्शक' (Tatva Darshak), an enlightened, reverent, and scholarly guide for ancient Indian scriptures (Vedas, Upanishads, Bhagavad Gita, Ramayana, Mahabharata).

CRITICAL MULTI-LANGUAGE INSTRUCTION:
The user has asked in '${parsed.language}' (or their specific language: Hindi, Hinglish, English, Bengali, Tamil, Telugu, Marathi, Sanskrit, Gujarati, etc.).
You MUST detect the user's language and respond COMPLETELY in the EXACT SAME LANGUAGE and SCRIPT:
- If asked in Hinglish (e.g. 'krodh ko kaise control kare?'), reply naturally in conversational, respectful Hinglish!
- If asked in Hindi (Devanagari), reply in pure, respectful Hindi!
- If asked in English, reply in English!
- If asked in Bengali, Tamil, Telugu, Marathi, Gujarati, etc., reply in that exact regional language!
- If asked in Sanskrit, reply in Sanskrit!

Ground your response strictly in the following retrieved scripture passages from Tatva library:
${scriptureContext}

Format:
1. Direct wise guidance in the user's language.
2. The relevant Sanskrit shloka in Devanagari.
3. Detailed meaning and spiritual takeaway.
`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            ...messages.slice(0, -1).map((m: any) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            {
              role: "user",
              parts: [{ text: userQuery }],
            },
          ],
          config: {
            systemInstruction: promptInstruction,
            temperature: 0.3,
          },
        });

        if (geminiRes.text) {
          const citations = results.map(r => ({
            code: r.code,
            book: (parsed.isHindi ? r.book_name_hindi : r.book_name_english) || "Scripture",
            chapter: (parsed.isHindi ? r.chapter_name_hindi : r.chapter_name_english) || undefined,
            shlokaNumber: r.shloka_number,
            sanskrit: r.sanskrit ? r.sanskrit.slice(0, 100) + (r.sanskrit.length > 100 ? "..." : "") : undefined,
            link: `/shlokas/${r.code}`,
          }));

          return NextResponse.json({
            role: "assistant",
            content: geminiRes.text,
            citations,
            suggestedFollowUps: [
              parsed.language === "hinglish" ? "Iska agla shloka padhein" : parsed.isHindi ? "अगला श्लोक पढ़ें" : "Read next verse",
              parsed.language === "hinglish" ? "Man ko shant kaise karein?" : parsed.isHindi ? "मन को शांत कैसे करें?" : "How to calm the mind?",
            ],
          });
        }
      } catch (aiErr) {
        console.warn("AI generation note (using local multi-language synthesizer):", aiErr);
      }
    }

    // Zero-API Local Multi-Language Wisdom Response Synthesis
    const responsePayload = synthesizeScriptureResponse(parsed, results);

    return NextResponse.json({
      role: "assistant",
      content: responsePayload.content,
      citations: responsePayload.citations,
      suggestedFollowUps: responsePayload.suggestedFollowUps,
    });
  } catch (err: any) {
    console.error("Chat engine error:", err);
    return NextResponse.json(
      {
        role: "assistant",
        content: `सनातन ज्ञान सेवा में क्षणिक त्रुटि आई। कृपया पुनः प्रयास करें। (${err.message || "त्रुटि"})`,
        citations: [],
        suggestedFollowUps: ["भगवद्गीता २.४७", "क्रोध पर नियंत्रण"],
      },
      { status: 200 }
    );
  }
}
