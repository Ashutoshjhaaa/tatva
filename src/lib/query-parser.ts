// ==============================================================================
// Tatva Natural Language Query & Intent Parser (Zero-API Engine)
// Multi-Language Detection, Intent Classification & Keyword Extraction
// ==============================================================================

import { findMatchingDharmicConcept, DharmicConcept } from "./dharmic-thesaurus";

export type DetectedLanguage = 
  | "hindi" 
  | "hinglish" 
  | "english" 
  | "sanskrit" 
  | "marathi"
  | "bengali" 
  | "gujarati" 
  | "tamil" 
  | "telugu" 
  | "kannada" 
  | "malayalam"
  | "other";

export type QueryIntentType = 
  | "GREETING" 
  | "HELP" 
  | "DIRECT_VERSE" 
  | "THEMATIC_CONCEPT" 
  | "KEYWORD_SEARCH";

export interface ParsedQuery {
  rawQuery: string;
  intent: QueryIntentType;
  bookCode?: string; // "bg", "rv", "rm", "mb", etc.
  chapterNumber?: number;
  shlokaNumber?: number;
  explicitVerseCode?: string; // e.g. "bg-1-1-1"
  concept?: DharmicConcept | null;
  searchKeywords: string[];
  language: DetectedLanguage;
  isHindi: boolean;
}

// Book alias dictionary
const BOOK_ALIASES: Record<string, string> = {
  "gita": "bg",
  "geeta": "bg",
  "bhagavad": "bg",
  "bhagwat": "bg",
  "गीता": "bg",
  "भगवद्गीता": "bg",
  "bg": "bg",

  "rigveda": "rv",
  "rigved": "rv",
  "ऋग्वेद": "rv",
  "rv": "rv",

  "ramayana": "rm",
  "valmiki": "rm",
  "रामायण": "rm",
  "rm": "rm",

  "mahabharata": "mb",
  "mahabharat": "mb",
  "महाभारत": "mb",
  "mb": "mb",

  "bhagavatam": "sbp",
  "bhagavat": "sbp",
  "भागवत": "sbp",
  "sbp": "sbp",

  "yoga vasishtha": "yv",
  "vasishtha": "yv",
  "वासिष्ठ": "yv",
  "yv": "yv"
};

/**
 * Intelligent Multi-Language Detector
 * Detects Hindi, Hinglish, Sanskrit, English, Bengali, Tamil, Telugu, Gujarati, Marathi, etc.
 */
export function detectLanguage(text: string): DetectedLanguage {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Regional Indian scripts
  if (/[\u0980-\u09FF]/.test(trimmed)) return "bengali";
  if (/[\u0A80-\u0AFF]/.test(trimmed)) return "gujarati";
  if (/[\u0B80-\u0BFF]/.test(trimmed)) return "tamil";
  if (/[\u0C00-\u0C7F]/.test(trimmed)) return "telugu";
  if (/[\u0C80-\u0CFF]/.test(trimmed)) return "kannada";
  if (/[\u0D00-\u0D7F]/.test(trimmed)) return "malayalam";

  // 2. Devanagari script analysis (Hindi vs Marathi vs Sanskrit)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    // Check Marathi specific words
    if (/\b(आहे|कसे|काय|करणार|सांगा|होते|माहिती|तुला)\b/.test(trimmed)) {
      return "marathi";
    }
    // Check Sanskrit specific markers
    if (/\b(उवाच|कथम्|अस्ति|भवति|श्लोकः|अर्थः|नमः|वद|इति|शान्तिः|ब्रह्म)\b/.test(trimmed)) {
      return "sanskrit";
    }
    return "hindi";
  }

  // 3. Roman / Latin script analysis (Hinglish vs English vs Sanskrit IAST)
  const hinglishWords = [
    "kya", "kaise", "batao", "karo", "karna", "kare", "karein", "hai", "hain", "hoon", 
    "hoga", "mujhe", "aap", "hum", "shanti", "krodh", "mann", "bhagwan", "jeevan", 
    "ke", "ki", "ko", "mein", "se", "par", "kyu", "kyon", "bataiye", "suno", "arth", 
    "samjhao", "nahi", "matlab", "chahiye", "bolte", "likha", "shloka", "adhyay", "kripya"
  ];

  const words = lower.split(/[^a-zA-Z]+/);
  let hinglishCount = 0;
  for (const w of words) {
    if (hinglishWords.includes(w)) {
      hinglishCount++;
    }
  }

  // If contains 1 or more distinct Hinglish phonetic words, classify as Hinglish
  if (hinglishCount >= 1) {
    return "hinglish";
  }

  // Sanskrit IAST keywords
  if (/\b(uvaca|dharma|karmaṇy|namah|iti|brahman|atman)\b/i.test(lower)) {
    return "sanskrit";
  }

  return "english";
}

// Greeting detector
function isGreeting(text: string): boolean {
  const greetings = [
    "namaste", "pranam", "hello", "hi", "hey", "hare krishna", "jai shri krishna", "jai shree ram",
    "नमस्ते", "प्रणाम", "नमस्कार", "जय श्री कृष्ण", "हरे कृष्ण", "जय श्री राम", "राधे राधे", "हर हर महादेव",
    "নমস্কার", "வணக்கம்", "నమస్కారం", "નમસ્તે", "नमस्कार"
  ];
  const clean = text.toLowerCase().trim();
  return greetings.some(g => clean === g || clean.startsWith(g + " ") || clean.endsWith(" " + g));
}

// Help / Bot identity detector
function isHelpOrIdentity(text: string): boolean {
  const helpPatterns = [
    "who are you", "what can you do", "help", "how do you work", "about yourself",
    "tum kaun ho", "kaun ho tum", "kya kar sakte ho", "kya pooch sakta hu", "kaise use kare",
    "तुम कौन हो", "आप कौन हैं", "मदद", "क्या कर सकते हो", "सहयोग", "তুমি কে", "நீ யார்"
  ];
  const clean = text.toLowerCase().trim();
  return helpPatterns.some(h => clean.includes(h));
}

export function parseUserQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const language = detectLanguage(trimmed);
  const isHindi = language === "hindi" || language === "hinglish";

  // 1. Check for Greeting
  if (isGreeting(lower)) {
    return {
      rawQuery: trimmed,
      intent: "GREETING",
      searchKeywords: [],
      language,
      isHindi,
    };
  }

  // 2. Check for Help or Identity query
  if (isHelpOrIdentity(lower)) {
    return {
      rawQuery: trimmed,
      intent: "HELP",
      searchKeywords: [],
      language,
      isHindi,
    };
  }

  // 3. Detect Book filter from query
  let detectedBookCode: string | undefined;
  for (const [alias, code] of Object.entries(BOOK_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(lower)) {
      detectedBookCode = code;
      break;
    }
  }

  // 4. Check for direct code (e.g., "bg-1-1-1", "rv-7-95-4", "rm-1-1-1")
  const directCodeMatch = trimmed.match(/\b([a-z]{2,3}-\d+-\d+-\d+)\b/i);
  if (directCodeMatch) {
    return {
      rawQuery: trimmed,
      intent: "DIRECT_VERSE",
      explicitVerseCode: directCodeMatch[1].toLowerCase(),
      searchKeywords: [directCodeMatch[1].toLowerCase()],
      language,
      isHindi,
    };
  }

  // 5. Check for verse patterns like "2.47", "2:47", "chapter 2 shloka 47", "अध्याय 2 श्लोक 47"
  const numericVerseMatch = lower.match(/(?:chapter|adhyay|अध्याय)?\s*([0-9]+)\s*(?:[.:,\s]|shloka|श्लोक)\s*([0-9]+)/i);
  if (numericVerseMatch) {
    const chNum = parseInt(numericVerseMatch[1], 10);
    const shlokaNum = parseInt(numericVerseMatch[2], 10);
    return {
      rawQuery: trimmed,
      intent: "DIRECT_VERSE",
      bookCode: detectedBookCode || "bg", // default to Gita if not specified
      chapterNumber: chNum,
      shlokaNumber: shlokaNum,
      searchKeywords: [`${chNum}`, `${shlokaNum}`],
      language,
      isHindi,
    };
  }

  // 6. Check for Dharmic Concept match
  const matchedConcept = findMatchingDharmicConcept(lower);
  if (matchedConcept) {
    return {
      rawQuery: trimmed,
      intent: "THEMATIC_CONCEPT",
      bookCode: detectedBookCode || matchedConcept.canonicalBook,
      concept: matchedConcept,
      searchKeywords: matchedConcept.keywords.slice(0, 4),
      language,
      isHindi,
    };
  }

  // 7. General Keyword Search - Extract clean significant search terms
  const stopWords = new RegExp(
    "\\b(what|is|the|about|tell|me|how|does|say|in|to|of|and|a|an|kya|hai|kaise|batao|ke|ki|ko|mein|se|karein|kare|अर्थ|का|की|के|में|से|पर|है|बताओ|क्या)\\b",
    "gi"
  );
  const cleanedText = trimmed.replace(stopWords, " ").replace(/[?!,.:;()]/g, " ").replace(/\s+/g, " ").trim();
  const searchTerms = cleanedText.split(" ").filter(w => w.length > 2);

  return {
    rawQuery: trimmed,
    intent: "KEYWORD_SEARCH",
    bookCode: detectedBookCode,
    searchKeywords: searchTerms.length > 0 ? searchTerms : [trimmed],
    language,
    isHindi,
  };
}
