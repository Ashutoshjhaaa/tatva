// ==============================================================================
// Tatva Wisdom Synthesizer (Zero-API Response Generation Engine)
// Multi-language response adapter: Hindi, Hinglish, English, Sanskrit & more
// ==============================================================================

import { ParsedQuery, DetectedLanguage } from "./query-parser";
import { DharmicConcept } from "./dharmic-thesaurus";

export interface ShlokaSearchResult {
  id: string;
  code: string;
  shloka_number: number;
  sanskrit?: string | null;
  transliteration?: string | null;
  translation_english?: string | null;
  translation_hindi?: string | null;
  chapter_name_english?: string | null;
  chapter_name_hindi?: string | null;
  chapter_number?: number | null;
  book_name_english?: string | null;
  book_name_hindi?: string | null;
  book_code?: string | null;
  score?: number;
}

export interface SynthesizedResponse {
  content: string;
  citations: Array<{
    code: string;
    book: string;
    chapter?: string;
    shlokaNumber?: number;
    sanskrit?: string;
    link: string;
  }>;
  suggestedFollowUps: string[];
}

export function synthesizeScriptureResponse(
  parsed: ParsedQuery,
  results: ShlokaSearchResult[]
): SynthesizedResponse {
  const lang: DetectedLanguage = parsed.language;

  // --------------------------------------------------------------------------
  // 1. Handling GREETING Intent
  // --------------------------------------------------------------------------
  if (parsed.intent === "GREETING") {
    let greetingText = "";
    let followUps: string[] = [];

    if (lang === "hinglish") {
      greetingText = `Om Namo Narayanaya! 🙏\n\nPranam! Main **Tatva Darshak** hoon — aapke Sanatan scriptures ka digital guide.\n\nAap kisi bhi dharmic topic (jaise: *karma, krodh, shanti, atman, srishti*) ya specific shloka number (e.g. *2.47* ya *Gita 2 47*) ke baare me pooch sakte hain.`;
      followUps = [
        "Nishkama karma kya hai?",
        "Krodh ko kaise control kare?",
        "Rigveda me universe creation ke bare me kya likha hai?",
        "Atma ki amarta par Gita ka updesh"
      ];
    } else if (lang === "sanskrit") {
      greetingText = `ॐ नमो नारायणाय! 🙏\n\nसादरं प्रणामः। अहं **तत्त्वदर्शकः** — सनातनधर्मस्य पावनग्रन्थानां (ऋग्वेदः, श्रीमद्भगवद्गीता, रामायणम्) भवतः संवादात्मकः मार्गदर्शकः अस्मि।\n\nभवन्तः कामपि जिज्ञासां, श्लोकसन्दर्भं वा प्रष्टुं शक्नुवन्ति।`;
      followUps = [
        "कर्मण्येवाधिकारस्ते कः अर्थः?",
        "शान्ति पाठस्य महत्वम्",
        "स्थितप्रज्ञस्य का भाषा?"
      ];
    } else if (lang === "hindi" || lang === "marathi") {
      greetingText = `ॐ नमो नारायणाय! 🙏\n\nसादर प्रणाम। मैं **तत्त्व दर्शक** हूँ — सनातन धर्म के पावन शास्त्रों (ऋग्वेद, श्रीमद्भगवद्गीता, वाल्मीकि रामायण, महाभारत आदि) का आपका डिजिटल मार्गदर्शक।\n\nआप किसी भी आध्यात्मिक विषय, जीवन के संशय, अथवा विशिष्ट श्लोक (उदा. *'कर्मण्येवाधिकारस्ते'*, *'क्रोध का नियंत्रण'*, अथवा *'२.४७'*) के विषय में पूछ सकते हैं।`;
      followUps = [
        "भगवद्गीता के अनुसार निष्काम कर्म क्या है?",
        "क्रोध और मन की चंचलता को कैसे वश में करें?",
        "ऋग्वेद के नासदीय सूक्त में सृष्टि रचना का वर्णन",
        "आत्मा की अमरता पर गीता का क्या उपदेश है?"
      ];
    } else {
      // Default English
      greetingText = `Om Namo Narayanaya! 🙏\n\nWarm greetings. I am **Tatva Darshak** — your dedicated guide to the sacred wisdom of Sanatan Dharma (Rigveda, Bhagavad Gita, Valmiki Ramayana, Mahabharata, and more).\n\nYou can ask about any philosophical topic, life guidance, or specific verses (e.g. *"What is Nishkama Karma?"*, *"Mind control"*, or *"Gita 2.47"*).`;
      followUps = [
        "What is Nishkama Karma in Bhagavad Gita?",
        "How to control anger and mind?",
        "What does Rigveda say about the creation of the Universe?",
        "The immortal nature of the Soul in Gita"
      ];
    }

    return {
      content: greetingText,
      citations: [],
      suggestedFollowUps: followUps,
    };
  }

  // --------------------------------------------------------------------------
  // 2. Handling HELP Intent
  // --------------------------------------------------------------------------
  if (parsed.intent === "HELP") {
    let helpText = "";
    if (lang === "hinglish") {
      helpText = `**Tatva Darshak kaise use karein:**\n\n1. **Direct Shloka Search:**\n   - \`2.47\` ya \`Gita 2 47\` (Chapter aur shloka number)\n   - \`bg-1-1-1\` ya \`rv-7-95-4\` (Exact verse code)\n\n2. **Topic wise Question:**\n   - *Karma, Dharma, Shanti, Krodh, Atma, Meditation, Bhakti*\n\n3. **Specific Scripture:**\n   - *Rigveda creation hymns* ya *Gita anger control*\n\nSabhi answers aapke database me stored authentic shlokas par based hain.`;
    } else if (lang === "hindi" || lang === "marathi") {
      helpText = `**तत्त्व दर्शक के उपयोग की विधि:**\n\n1. **सीधा श्लोक खोजें:**\n   - \`२.४७\` या \`Gita 2 47\` (अध्याय और श्लोक संख्या)\n   - \`bg-1-1-1\` या \`rv-7-95-4\` (विशिष्ट श्लोक कोड)\n\n2. **दार्शनिक विषय पूछें:**\n   - *कर्म, धर्म, आत्मा, शांति, ध्यान, भक्ति, सृष्टि की उत्पत्ति*\n\n3. **विशिष्ट ग्रंथ में खोजें:**\n   - *ऋग्वेद में सृष्टि वर्णन* या *गीता में निष्काम कर्म*\n\nसभी उत्तर सीधे आपके डेटाबेस के प्रामाणिक श्लोकों पर आधारित हैं।`;
    } else {
      helpText = `**How to use Tatva Darshak:**\n\n1. **Direct Verse Lookup:**\n   - Type \`2.47\` or \`Gita 2:47\` (Chapter & verse number)\n   - Type exact scripture code like \`bg-1-1-1\` or \`rv-7-95-4\`\n\n2. **Thematic Spiritual Inquiries:**\n   - *Karma, Dharma, Soul, Peace, Anger control, Creation, Devotion*\n\n3. **Scripture-Specific Queries:**\n   - *Creation in Rigveda*, *Duty in Gita*, *Dharma in Ramayana*\n\nAll answers are grounded 100% in verified scriptural verses.`;
    }

    return {
      content: helpText,
      citations: [],
      suggestedFollowUps: [
        lang === "hinglish" ? "Karma kya hai?" : lang === "hindi" ? "कर्म क्या है?" : "What is Karma?",
        "Gita 2.47",
        lang === "hinglish" ? "Shanti kaise milegi?" : lang === "hindi" ? "शांति कैसे प्राप्त करें?" : "How to find peace?"
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 3. Handling when no matching results are found in the database
  // --------------------------------------------------------------------------
  if (!results || results.length === 0) {
    if (parsed.concept) {
      const title = lang === "english" ? parsed.concept.nameEnglish : parsed.concept.nameHindi;
      const desc = lang === "english" ? parsed.concept.summaryEnglish : parsed.concept.summaryHindi;
      return {
        content: `### 🕉️ ${title}\n\n${desc}\n\n*(Explore more in Tatva Digital Library).*`,
        citations: [],
        suggestedFollowUps: parsed.concept.recommendedQueries,
      };
    }

    let noResult = "";
    if (lang === "hinglish") {
      noResult = `Maaf kijiye, aapki query **"${parsed.rawQuery}"** se related koi shloka database me nahi mila.\n\n💡 **Tip:** Kisi main keyword se search karein (jaise: *karma, shanti, krodh, atma, 2.47*).`;
    } else if (lang === "hindi" || lang === "marathi") {
      noResult = `क्षमा करें, आपके प्रश्न **"${parsed.rawQuery}"** से संबंधित कोई श्लोक वर्तमान डेटाबेस में नहीं मिला।\n\n💡 **सुझाव:** किसी प्रमुख दार्शनिक शब्द (जैसे: *कर्म, धर्म, शांति, आत्मा, क्रोध*) या श्लोक संख्या (*२.४७*) से खोजें।`;
    } else {
      noResult = `I could not find exact verses matching your query **"${parsed.rawQuery}"** in the current database collection.\n\n💡 **Tip:** Try searching by spiritual keywords (e.g., *karma, dharma, soul, peace, anger*) or verse numbers (e.g., *Gita 2.47*).`;
    }

    return {
      content: noResult,
      citations: [],
      suggestedFollowUps: [
        lang === "hinglish" ? "Krodh ko kaise control kare?" : "भगवद्गीता के अनुसार निष्काम कर्म क्या है?",
        "Gita 2.47",
        "शांति पाठ"
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 4. Build Structured Wisdom Response in Detected Language
  // --------------------------------------------------------------------------
  const primaryShloka = results[0];
  const isHindiScript = lang === "hindi" || lang === "marathi" || lang === "sanskrit";
  
  const bookName = isHindiScript
    ? primaryShloka.book_name_hindi || primaryShloka.book_name_english || "पवित्र ग्रंथ"
    : primaryShloka.book_name_english || "Sacred Scripture";
  
  const chapterName = isHindiScript
    ? primaryShloka.chapter_name_hindi || primaryShloka.chapter_name_english || `अध्याय ${primaryShloka.chapter_number || ""}`
    : primaryShloka.chapter_name_english || `Chapter ${primaryShloka.chapter_number || ""}`;

  let content = "";

  // Introduction based on language
  if (parsed.concept) {
    const conceptTitle = lang === "english" ? parsed.concept.nameEnglish : parsed.concept.nameHindi;
    const conceptDesc = lang === "english" ? parsed.concept.summaryEnglish : parsed.concept.summaryHindi;
    content += `### 🕉️ ${conceptTitle}\n\n${conceptDesc}\n\n---\n\n`;
  }

  if (lang === "hinglish") {
    content += `**${bookName} (${chapterName}, Shloka ${primaryShloka.shloka_number})** aapke sawal ka bahut sundar margdarshan karta hai:\n\n`;
  } else if (isHindiScript) {
    content += `**${bookName} (${chapterName}, श्लोक ${primaryShloka.shloka_number})** आपके प्रश्न का अत्यंत सुंदर मार्गदर्शन करता है:\n\n`;
  } else {
    content += `In **${bookName} (${chapterName}, Verse ${primaryShloka.shloka_number})**, the sacred text provides profound guidance:\n\n`;
  }

  // Sanskrit Verse
  if (primaryShloka.sanskrit) {
    content += `> 📜 **मूल संस्कृत श्लोक:**\n> \n> **${primaryShloka.sanskrit.replace(/\n/g, "\n> ")}**\n\n`;
  }

  // Transliteration
  if (primaryShloka.transliteration) {
    content += `*लिप्यंतरण (Transliteration):*\n*${primaryShloka.transliteration.slice(0, 150)}...*\n\n`;
  }

  // Hindi Meaning
  if (primaryShloka.translation_hindi) {
    content += `✨ **हिंदी भावार्थ:**\n${primaryShloka.translation_hindi}\n\n`;
  }

  // English Meaning
  if (primaryShloka.translation_english) {
    content += `📖 **English Meaning:**\n"${primaryShloka.translation_english}"\n\n`;
  }

  // Citations list
  const citations = results.map(r => ({
    code: r.code,
    book: (isHindiScript ? r.book_name_hindi : r.book_name_english) || "Scripture",
    chapter: (isHindiScript ? r.chapter_name_hindi : r.chapter_name_english) || undefined,
    shlokaNumber: r.shloka_number,
    sanskrit: r.sanskrit ? r.sanskrit.slice(0, 100) + (r.sanskrit.length > 100 ? "..." : "") : undefined,
    link: `/shlokas/${r.code}`,
  }));

  // Follow-ups in user's language
  const suggestedFollowUps: string[] = [];
  if (lang === "hinglish") {
    suggestedFollowUps.push(
      `Shloka ${primaryShloka.shloka_number + 1} padhein`,
      "Man ki shanti ke upay",
      "Nishkama karma kya hai?"
    );
  } else if (isHindiScript) {
    suggestedFollowUps.push(
      `श्लोक ${primaryShloka.shloka_number + 1} पढ़ें`,
      "मन की शांति का उपाय",
      "निष्काम कर्म क्या है?"
    );
  } else {
    suggestedFollowUps.push(
      `Read Verse ${primaryShloka.shloka_number + 1}`,
      "How to calm the mind?",
      "Meaning of Nishkama Karma"
    );
  }

  return {
    content,
    citations,
    suggestedFollowUps,
  };
}
