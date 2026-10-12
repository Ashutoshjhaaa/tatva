"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  ExternalLink, 
  BookOpen, 
  RotateCcw, 
  Copy,
  Check,
  Filter
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Citation {
  code: string;
  book: string;
  chapter?: string;
  shlokaNumber?: number;
  sanskrit?: string;
  link: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  suggestedFollowUps?: string[];
  timestamp: Date;
}

const SCRIPTURE_FILTERS = [
  { code: "all", labelHindi: "सभी शास्त्र", labelEnglish: "All Texts" },
  { code: "bg", labelHindi: "भगवद्गीता", labelEnglish: "Bhagavad Gita" },
  { code: "rv", labelHindi: "ऋग्वेद", labelEnglish: "Rigveda" },
  { code: "rm", labelHindi: "रामायण", labelEnglish: "Ramayana" },
  { code: "mb", labelHindi: "महाभारत", labelEnglish: "Mahabharata" },
];

const INITIAL_SUGGESTIONS = [
  "कर्मण्येवाधिकारस्ते का अर्थ",
  "क्रोध को कैसे वश में करें?",
  "ऋग्वेद में सृष्टि रचना का वर्णन",
  "Gita 2.47",
];

export function TatvaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content: "ॐ नमो नारायणाय! 🙏\n\nमैं **तत्त्व दर्शक** हूँ — आपके डेटाबेस में संचित सनातन शास्त्रों का प्रामाणिक मार्गदर्शक। आप किसी भी दार्शनिक विषय (जैसे: *कर्म, धर्म, आत्मा, शांति, सृष्टि*) या श्लोक संख्या (उदा: *२.४७*) के विषय में पूछ सकते हैं।",
      timestamp: new Date(),
      suggestedFollowUps: INITIAL_SUGGESTIONS,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          bookFilter: selectedBook,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.content || "उत्तर प्राप्त नहीं हो सका।",
        citations: data.citations || [],
        suggestedFollowUps: data.suggestedFollowUps || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `उत्तर प्राप्त करने में समस्या आई: ${err.message || "कृपया पुनः प्रयास करें"}.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: "assistant",
        content: "ज्ञान संवाद पुनः आरंभ हुआ। अपने मन का प्रश्न पूछें।",
        timestamp: new Date(),
        suggestedFollowUps: INITIAL_SUGGESTIONS,
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-amber-50 shadow-2xl shadow-amber-950/60 border border-amber-400/40 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
          aria-label="तत्त्व दर्शक AI चैट खोलें"
        >
          <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="तत्त्व"
              width={24}
              height={24}
              className="w-6 h-6 object-contain rounded-full shadow-sm"
            />
          </div>
          <span className="font-serif tracking-wide text-sm font-semibold">
            तत्त्व दर्शक (शास्त्र AI)
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh] flex flex-col rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl shadow-black/90 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="px-4 py-3 border-b border-amber-500/20 bg-gradient-to-r from-zinc-900/90 via-amber-950/30 to-zinc-900/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/30 flex items-center justify-center shadow-inner overflow-hidden p-1.5">
                  <Image
                    src="/logo.png"
                    alt="तत्त्व"
                    width={28}
                    height={28}
                    className="w-6 h-6 object-contain rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-amber-200 tracking-wide flex items-center gap-1.5">
                    तत्त्व दर्शक (Tatva Darshak)
                    <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      100% प्रामाणिक
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    वेदों, उपनिषदों व भगवद्गीता का ज्ञान भंडार
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="संवाद रीसेट करें"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="बंद करें"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scripture Filter Pills */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-500/10 overflow-x-auto scrollbar-none pb-0.5">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-amber-400" /> ग्रंथ:
              </span>
              {SCRIPTURE_FILTERS.map((f) => (
                <button
                  key={f.code}
                  onClick={() => setSelectedBook(f.code)}
                  className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 transition-all cursor-pointer ${
                    selectedBook === f.code
                      ? "bg-amber-600 text-zinc-950 font-semibold shadow-sm shadow-amber-950"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 border border-zinc-800"
                  }`}
                >
                  {f.labelHindi}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50 rounded-br-none shadow-md"
                      : "bg-zinc-900/90 text-zinc-200 border border-amber-500/15 rounded-bl-none shadow-inner"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed font-sans text-[13.5px]">
                    {msg.content}
                  </div>

                  {/* Citations / Scripture Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>संदर्भित श्लोक (Scripture Citations):</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.citations.map((cite, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-zinc-950/80 border border-amber-500/25 text-xs text-zinc-300 flex items-start justify-between gap-2.5"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-amber-300 flex items-center gap-2">
                                <span>{cite.book}</span>
                                {cite.chapter && (
                                  <span className="text-zinc-400 font-normal">
                                    • {cite.chapter}
                                  </span>
                                )}
                                {cite.shlokaNumber && (
                                  <span className="text-amber-400/80 font-mono text-[11px]">
                                    [श्लोक {cite.shlokaNumber}]
                                  </span>
                                )}
                              </div>
                              {cite.sanskrit && (
                                <p className="font-serif text-[11px] text-amber-100/80 italic mt-1 line-clamp-2">
                                  {cite.sanskrit}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              {cite.sanskrit && (
                                <button
                                  onClick={() => handleCopy(cite.sanskrit!, cite.code)}
                                  title="श्लोक कॉपी करें"
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                                >
                                  {copiedCode === cite.code ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                              <Link
                                href={cite.link}
                                className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-zinc-800/80 transition-colors"
                                title="पूरा श्लोक पढ़ें"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Follow-Up Suggestions */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-amber-500/15">
                      <p className="text-[10.5px] text-amber-300/80 mb-1.5 font-medium">
                        आगे क्या जानना चाहते हैं?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSend(prompt)}
                            className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950/70 hover:bg-amber-950/50 text-zinc-300 hover:text-amber-200 border border-zinc-800 hover:border-amber-500/30 transition-all cursor-pointer"
                          >
                            {prompt} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs bg-zinc-900/60 p-3 rounded-2xl w-fit border border-zinc-800">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>शास्त्रों से ज्ञान खोजा जा रहा है...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-amber-500/20 bg-zinc-950/95">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="शास्त्रों से पूछें (उदा. 'कर्म', '२.४७', 'शांति')..."
                disabled={isLoading}
                className="flex-1 bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-sm px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-zinc-950 font-semibold transition-all active:scale-95 shadow-md shadow-amber-950/50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500 px-1">
              <span>तत्त्व डिजिटल ज्ञान भंडार</span>
              <span className="text-amber-500/60">0 API Key • 100% Free</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
