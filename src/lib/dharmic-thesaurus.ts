// ==============================================================================
// Tatva Dharmic Concept Thesaurus & Knowledge Graph (Zero-API Engine)
// Maps spiritual themes, philosophical queries, synonyms & canonical verses
// ==============================================================================

export interface DharmicConcept {
  id: string;
  nameEnglish: string;
  nameHindi: string;
  keywords: string[];
  canonicalBook?: string; // e.g. "bg", "rv", "yv"
  canonicalVerseHint?: string; // e.g. "bg-1-2-47"
  summaryHindi: string;
  summaryEnglish: string;
  recommendedQueries: string[];
}

export const DHARMIC_CONCEPTS: DharmicConcept[] = [
  {
    id: "karma",
    nameEnglish: "Karma & Nishkama Karma (Action & Duty)",
    nameHindi: "कर्म एवं निष्काम कर्मयोग",
    keywords: [
      "karma", "action", "duty", "work", "deeds", "nishkama", "fruit of action",
      "कर्म", "कर्तव्य", "कार्य", "निष्काम", "फल", "कर्मयोग", "कर्मण्येवाधिकारस्ते"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-2-47",
    summaryHindi: "भगवद्गीता के अनुसार मनुष्य का अधिकार केवल अपने कर्तव्य-कर्म करने में है, उसके फलों पर कभी नहीं। फल की आसक्ति छोड़कर अनासक्त भाव से किया गया कर्म ही निष्काम कर्मयोग कहलाता है।",
    summaryEnglish: "According to the Bhagavad Gita, you have a right only to perform your prescribed duty, but never to the fruits of action. Renouncing attachment to outcomes and dedicating work is the essence of Nishkama Karma Yoga.",
    recommendedQueries: [
      "कर्मण्येवाधिकारस्ते का अर्थ",
      "निष्काम कर्म क्या है?",
      "फल की इच्छा के बिना कार्य कैसे करें?"
    ]
  },
  {
    id: "krodha",
    nameEnglish: "Anger, Desire & Mind Control (Krodha & Kama)",
    nameHindi: "क्रोध, काम एवं मन का संयम",
    keywords: [
      "anger", "rage", "desire", "passion", "delusion", "control mind", "mind", "stress",
      "क्रोध", "गुस्सा", "काम", "कामना", "मोह", "अहंकार", "मन", "संयम", "शांति", "विषाद"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-2-62",
    summaryHindi: "गीता (अध्याय २) में श्रीकृष्ण समझाते हैं कि विषयों का निरंतर चिंतन करने से आसक्ति, आसक्ति से काम (इच्छा), और काम में बाधा आने पर क्रोध उत्पन्न होता है। क्रोध से सम्मोह (बुद्धि का नाश) होता है और बुद्धि नाश से मनुष्य का पतन होता है।",
    summaryEnglish: "In Gita Chapter 2, Lord Krishna explains that contemplation on sense objects leads to attachment, from attachment arises desire, and from unfulfilled desire comes anger. Anger leads to clouding of memory and destruction of intellect.",
    recommendedQueries: [
      "क्रोध पर नियंत्रण कैसे करें?",
      "मन को शांत रखने का उपाय क्या है?",
      "गीता में क्रोध के दुष्परिणाम"
    ]
  },
  {
    id: "atman",
    nameEnglish: "The Soul & Immortality (Atman & Death)",
    nameHindi: "आत्मा का स्वरूप एवं अमरता",
    keywords: [
      "soul", "atman", "death", "immortal", "rebirth", "body", "reincarnation",
      "आत्मा", "मृत्यु", "अमर", "पुनर्जन्म", "शरीर", "नैनं छिन्दन्ति", "अविनाशी", "जीवात्मा"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-2-20",
    summaryHindi: "शास्त्रों के अनुसार आत्मा अजन्मा, नित्य, शाश्वत और पुरातन है। इसे न शस्त्र काट सकते हैं, न अग्नि जला सकती है, न जल भिगो सकता है और न वायु सुखा सकती है। शरीर का नाश होने पर भी आत्मा का नाश नहीं होता।",
    summaryEnglish: "The scriptures affirm that the soul (Atman) is unborn, eternal, ever-existing, and primeval. Weapons cannot cleave it, fire cannot burn it, water cannot wet it, nor can the wind wither it. When the body perishes, the soul remains immortal.",
    recommendedQueries: [
      "आत्मा क्या है?",
      "मृत्यु के बाद आत्मा का क्या होता है?",
      "नैनं छिन्दन्ति शस्त्राणि का अर्थ"
    ]
  },
  {
    id: "srishti",
    nameEnglish: "Creation of the Universe (Cosmology & Nasadiya Sukta)",
    nameHindi: "सृष्टि की उत्पत्ति एवं ब्रह्मांड (नासदीय सूक्त)",
    keywords: [
      "creation", "universe", "origin", "cosmos", "cosmology", "big bang", "nasadiya", "rigveda",
      "सृष्टि", "उत्पत्ति", "ब्रह्मांड", "नासदीय", "ऋग्वेद", "रचना", "प्रलय", "प्रकृति"
    ],
    canonicalBook: "rv",
    canonicalVerseHint: "rv-10-129-1",
    summaryHindi: "ऋग्वेद का सुप्रसिद्ध 'नासदीय सूक्त' (१०.१२९) सृष्टि के उद्भव का गहनतम दार्शनिक अन्वेषण करता है। सृष्टि से पूर्व न असत्य था, न सत्य; न अंधकार था, न प्रकाश। केवल एकाकी परम तत्त्व अपनी ही शक्ति से स्पंदित हो रहा था।",
    summaryEnglish: "The revered Nasadiya Sukta of the Rigveda (Mandala 10, Sukta 129) is ancient India's supreme philosophical hymn on creation. It poetically proclaims that in the beginning, there was neither existence nor non-existence; only the One unmanifest reality breathed by its own power.",
    recommendedQueries: [
      "ऋग्वेद में सृष्टि की रचना कैसे बताई गई है?",
      "नासदीय सूक्त का मुख्य भाव क्या है?",
      "सृष्टि से पहले क्या था?"
    ]
  },
  {
    id: "shanti",
    nameEnglish: "Inner Peace & Serenity (Shanti & Equanimity)",
    nameHindi: "आंतरिक शांति एवं समत्व",
    keywords: [
      "peace", "calm", "serenity", "anxiety", "equanimity", "happiness", "sukha",
      "शांति", "समत्व", "सुख", "प्रसन्नता", "धैर्य", "स्थिरप्रज्ञ", "शांति पाठ"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-2-70",
    summaryHindi: "जैसे सब ओर से जल से परिपूर्ण समुद्र नदियों के प्रवेश करने पर भी अपनी मर्यादा में अचल रहता है, वैसे ही जिस स्थितप्रज्ञ मनुष्य में सब भोग बिना विकार उत्पन्न किए समा जाते हैं, वही सच्ची शांति प्राप्त करता है।",
    summaryEnglish: "Just as the ocean remains undisturbed despite countless rivers constantly pouring into it, the sage into whom all desires merge without causing agitation alone attains everlasting peace.",
    recommendedQueries: [
      "स्थितप्रज्ञ के क्या लक्षण हैं?",
      "जीवन में वास्तविक शांति कैसे मिले?",
      "सुख और दुःख में सम रहने का मार्ग"
    ]
  },
  {
    id: "dharma",
    nameEnglish: "Dharma & Righteous Living",
    nameHindi: "धर्म एवं सदाचार",
    keywords: [
      "dharma", "righteousness", "morality", "truth", "satya", "ethics",
      "धर्म", "सत्य", "सदाचार", "नीति", "कर्तव्य", "यतो धर्मस्ततो जयः"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-4-7",
    summaryHindi: "धर्म केवल कर्मकांड नहीं, अपितु ब्रह्मांडीय संतुलन, सत्य, न्याय और सार्वभौमिक कल्याण का नाम है। जहाँ धर्म है, वहीं विजय है (यतो धर्मस्ततो जयः)। जब-जब धर्म की हानि होती है, तब-तब उसका उत्थान होता है।",
    summaryEnglish: "Dharma is not mere dogma, but the cosmic order, righteousness, truth, and duty that sustains all creation. Where there is righteousness, there is victory (Yato Dharmastato Jayah).",
    recommendedQueries: [
      "धर्म का वास्तविक अर्थ क्या है?",
      "यदा यदा हि धर्मस्य का क्या अर्थ है?",
      "धर्म और अधर्म में क्या अंतर है?"
    ]
  },
  {
    id: "bhakti",
    nameEnglish: "Devotion & Surrender (Bhakti Yoga)",
    nameHindi: "भक्ति एवं शरणागति",
    keywords: [
      "bhakti", "devotion", "love", "surrender", "sharanagati", "prayer", "faith", "shraddha",
      "भक्ति", "प्रेम", "समर्पण", "शरणागति", "श्रद्धा", "अनन्य", "प्रपत्ति"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-18-66",
    summaryHindi: "भगवान श्रीकृष्ण गीता के अंतिम उपदेश में कहते हैं: 'सब धर्मों का आश्रय त्यागकर केवल मेरी शरण में आओ; मैं तुम्हें समस्त पापों से मुक्त कर दूँगा, शोक मत करो।' अनन्य प्रेम और पूर्ण समर्पण ही पराभक्ति है।",
    summaryEnglish: "In the pinnacle verse of the Gita (18.66), Lord Krishna proclaims: 'Abandon all varieties of rituals and surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve.' Complete love and surrender is the heart of Bhakti.",
    recommendedQueries: [
      "सर्वधर्मान्परित्यज्य का क्या अर्थ है?",
      "सच्ची भक्ति किसे कहते हैं?",
      "भगवान की शरण में कैसे जाएं?"
    ]
  },
  {
    id: "yoga",
    nameEnglish: "Yoga & Meditation (Dhyana & Mind Stillness)",
    nameHindi: "योग, ध्यान एवं समाधि",
    keywords: [
      "yoga", "meditation", "dhyana", "samadhi", "pranayama", "focus",
      "योग", "ध्यान", "समाधि", "चित्त", "एकाग्रता", "योगश्चित्तवृत्तिनिरोधः", "योगस्थः"
    ],
    canonicalBook: "bg",
    canonicalVerseHint: "bg-1-2-48",
    summaryHindi: "योग का अर्थ है समत्व भाव—सिद्धि और असिद्धि में समान रहना ही योग कहलाता है (समत्वं योग उच्यते)। ध्यान द्वारा मन की वृत्तियों को शांत करके स्वयं के वास्तविक आत्म-स्वरूप में स्थित होना ही योग का लक्ष्य है।",
    summaryEnglish: "Yoga is equanimity of mind—being poised in success and failure alike (Samatvam Yoga Ucyate). Through meditation and steady practice, the mind transcends worldly agitation and rests in the bliss of the True Self.",
    recommendedQueries: [
      "योग का सच्चा अर्थ क्या है?",
      "समत्वं योग उच्यते का क्या तात्पर्य है?",
      "ध्यान कैसे लगाना चाहिए?"
    ]
  }
];

// Helper: match query against dharmic concepts
export function findMatchingDharmicConcept(query: string): DharmicConcept | null {
  const normalized = query.toLowerCase().trim();
  
  for (const concept of DHARMIC_CONCEPTS) {
    for (const kw of concept.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return concept;
      }
    }
  }
  return null;
}
