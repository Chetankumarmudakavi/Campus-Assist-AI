import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Send, Sparkles, Clock, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  FAQ,
  generateAIResponse,
  getCategories,
  getFAQs,
  getQueries,
  logQuery,
  matchFAQs,
  Query,
  seedIfEmpty,
} from "@/lib/store";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  matchedFaq?: FAQ;
  related?: FAQ[];
  source?: "faq" | "ai";
  ts: number;
}

const navItems = [
  { to: "/dashboard", label: "Helpdesk" },
  { to: "/dashboard/history", label: "History" },
  { to: "/dashboard/faqs", label: "Browse FAQs" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => getCategories(), []);
  const allFaqs = useMemo(() => getFAQs(), [messages.length]);

  useEffect(() => {
    seedIfEmpty();
    document.title = "Helpdesk — Ether";
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name?.split(" ")[0] || "there"}. I'm Ether — your campus intelligence layer. Ask me about admissions, fees, exams, hostel or library. You can also tap a suggestion below.`,
      ts: Date.now(),
    }]);
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || thinking) return;
    setInput("");
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: q, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);

    // Simulated thinking latency
    setTimeout(() => {
      const matches = matchFAQs(q, 4);
      let assistant: ChatMessage;
      if (matches.length > 0 && matches[0].score >= 0.5) {
        const top = matches[0].faq;
        const related = matches.slice(1).map((m) => m.faq);
        assistant = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: top.answer,
          matchedFaq: top,
          related,
          source: "faq",
          ts: Date.now(),
        };
        if (user) logQuery({ userId: user.id, question: q, response: top.answer, matchedFaqId: top.id });
      } else {
        const ai = generateAIResponse(q);
        assistant = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: ai,
          related: matches.map((m) => m.faq),
          source: "ai",
          ts: Date.now(),
        };
        if (user) logQuery({ userId: user.id, question: q, response: ai });
      }
      setMessages((m) => [...m, assistant]);
      setThinking(false);
    }, 600);
  };

  const toggleVoice = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    r.onend = () => setRecording(false);
    r.onerror = () => { setRecording(false); toast.error("Voice capture failed."); };
    recognitionRef.current = r;
    r.start();
    setRecording(true);
  };

  const suggestionFaqs = useMemo(() => {
    // Take 4 spread across categories
    const byCat: Record<string, FAQ> = {};
    for (const f of allFaqs) if (!byCat[f.categoryId]) byCat[f.categoryId] = f;
    return Object.values(byCat).slice(0, 4);
  }, [allFaqs]);

  const myQueries = useMemo<Query[]>(() => (user ? getQueries().filter((q) => q.userId === user.id).slice(0, 4) : []), [user, messages.length]);

  return (
    <AppShell nav={navItems}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Chat */}
        <section className="obsidian-card rounded-2xl flex flex-col h-[calc(100dvh-160px)] overflow-hidden">
          <header className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Campus Help Desk Dashboard</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Encrypted · Live</span>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onPick={(f) => send(f.question)} />
            ))}
            {thinking && (
              <div className="flex gap-3 animate-fade-up">
                <div className="size-8 shrink-0 rounded-lg bg-primary/15 border border-primary/20 grid place-items-center">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="bg-secondary/60 border border-border rounded-2xl rounded-tl-none px-4 py-3 text-sm text-muted-foreground flex gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Suggested inquiries</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {suggestionFaqs.map((f) => {
                    const cat = categories.find((c) => c.id === f.categoryId);
                    return (
                      <button
                        key={f.id}
                        onClick={() => send(f.question)}
                        className="text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/60 transition-all"
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{cat?.name}</span>
                        <span className="text-sm">{f.question}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors"
            >
              <Button type="button" size="icon" variant="ghost" onClick={toggleVoice} className="rounded-lg">
                {recording ? <MicOff className="size-4 text-destructive" /> : <Mic className="size-4" />}
              </Button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={recording ? "Listening…" : "Ask about deadlines, fees, hostel curfew…"}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60 py-2"
                maxLength={500}
              />
              <Button type="submit" disabled={!input.trim() || thinking} size="icon" className="rounded-lg bg-foreground text-background hover:bg-foreground/90">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="obsidian-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Recent queries</h3>
              <Clock className="size-3.5 text-muted-foreground" />
            </div>
            {myQueries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history yet — start a conversation.</p>
            ) : (
              <ul className="space-y-2">
                {myQueries.map((q) => (
                  <li key={q.id}>
                    <button onClick={() => send(q.question)} className="w-full text-left text-xs text-muted-foreground hover:text-foreground line-clamp-2">
                      → {q.question}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="obsidian-card rounded-2xl p-5">
            <h3 className="text-sm font-medium mb-3">Browse by category</h3>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => {
                const f = allFaqs.find((x) => x.categoryId === c.id);
                return (
                  <button
                    key={c.id}
                    disabled={!f}
                    onClick={() => f && send(f.question)}
                    className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-secondary transition-colors disabled:opacity-40"
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="obsidian-card rounded-2xl p-5">
            <h3 className="text-sm font-medium mb-2">Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
              <li>Be specific — include dates, course codes, or department names.</li>
              <li>Tap the mic to ask using your voice.</li>
              <li>Click a suggestion to repeat or refine.</li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
};

function MessageBubble({ message, onPick }: { message: ChatMessage; onPick: (f: FAQ) => void }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="size-8 shrink-0 rounded-lg bg-primary/15 border border-primary/20 grid place-items-center">
          <Sparkles className="size-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : ""}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-secondary/60 border border-border rounded-tl-none"
          }`}
        >
          {message.content}
        </div>
        {message.source && !isUser && (
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className={`size-1.5 rounded-full ${message.source === "faq" ? "bg-emerald-400" : "bg-amber-400"}`} />
            {message.source === "faq" ? "Matched FAQ" : "AI suggestion"}
          </div>
        )}
        {message.related && message.related.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.related.map((f) => (
              <button
                key={f.id}
                onClick={() => onPick(f)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:bg-secondary transition-colors"
              >
                {f.question.length > 60 ? f.question.slice(0, 60) + "…" : f.question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
