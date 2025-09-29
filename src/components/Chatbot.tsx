import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { monasteries, type Monastery } from "@/data/monasteries";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const normalize = (text: string) => text.toLowerCase().trim();

async function fetchGemini(messages: ChatMessage[]): Promise<string | null> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.text === 'string' && data.text.trim().length > 0) {
      return data.text.trim();
    }
    return null;
  } catch {
    return null;
  }
}

function answerQuestionLocal(question: string): string {
  const q = normalize(question);

  if (q.length === 0) return "Please type a question about monasteries, travel info, or festivals.";

  // Simple intents
  if (/hello|hi|namaste|hey/.test(q)) return "Namaste! How can I help you explore Sikkim's monasteries today?";

  // Find monastery by name
  const byName = monasteries.find(m => normalize(m.name).includes(q) || q.includes(normalize(m.id)));
  if (byName) {
    return `${byName.name} — ${byName.location}. Established ${byName.established}. ${byName.description} Visiting hours: ${byName.travelInfo.visitingHours}. Best time: ${byName.travelInfo.bestTimeToVisit}.`;
  }

  // Keyword based answers
  const matchAny = (m: Monastery, fields: (keyof Monastery)[], term: string) =>
    fields.some((f) => String((m as any)[f]).toLowerCase().includes(term));

  // Location queries
  if (q.includes("gangtok") || q.includes("east sikkim") || q.includes("west sikkim") || q.includes("north sikkim") || q.includes("south sikkim")) {
    const results = monasteries.filter(m => normalize(m.location).includes(q.replace("near ", "")));
    if (results.length) {
      return `Nearby places: ${results.map(r => r.name).join(", ")}. Ask about any to learn more.`;
    }
  }

  // Festivals
  if (q.includes("festival") || q.includes("losar") || q.includes("saga dawa") || q.includes("chaam")) {
    const results = monasteries.filter(m => m.festivals.some(f => normalize(f).includes(q.replace("festival", "").trim())));
    if (results.length) {
      return `Festivals related matches: ${results.map(r => `${r.name} (${r.festivals.join(", ")})`).join("; ")}`;
    }
  }

  // Generic: show top 3 matches by description/location
  const term = q.split(/\s+/).filter(Boolean).slice(0, 3).join(" ");
  const results = monasteries.filter(m =>
    matchAny(m, ["name", "location", "significance", "architecture"], term)
    || m.description.toLowerCase().includes(term)
  ).slice(0, 3);
  if (results.length) {
    return `I found: ${results.map(r => r.name).join(", ")}. Ask about any name to get details.`;
  }

  return "I couldn't find that yet. Try asking about a monastery name, location (e.g., Gangtok), or a festival (e.g., Losar).";
}

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I’m the Monastery360 guide. Ask me about monasteries, directions, visiting hours, or festivals.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Try Gemini first
    const draft = [...messages, userMsg];
    const gemini = await fetchGemini(draft);
    if (gemini) {
      const botMsgGemini: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: gemini };
      setMessages((prev) => [...prev, botMsgGemini]);
      return;
    }

    // Fallback to local Q&A
    const replyText = answerQuestionLocal(text);
    const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: replyText };
    setMessages((prev) => [...prev, botMsg]);
  };

  const suggestions = useMemo(
    () => [
      "Tell me about Rumtek",
      "Monasteries near Gangtok",
      "When is Losar celebrated?",
    ],
    []
  );

  const floating = (
    <div
      className="fixed bottom-5 right-5 z-40"
      style={{ position: "fixed", bottom: 20, right: 20, zIndex: 40 }}
    >
      {open && (
        <Card
          className="mb-3 w-[360px] max-w-[90vw] shadow-xl border-border"
          style={{ width: 360, maxWidth: "90vw" }}
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="font-semibold">Monastery360 Chat</div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X />
            </Button>
          </div>
          <div className="p-0">
            <ScrollArea className="h-72 p-3">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap",
                      m.role === "assistant" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground ml-auto"
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about monasteries, travel info, festivals..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <Button onClick={handleSend} aria-label="Send">
                  <Send />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Button key={s} variant="secondary" size="sm" onClick={() => setInput(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button
        className="rounded-full shadow-lg"
        variant="monastery"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat"
        style={{ height: 50, width: 50 }}
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  );

  return createPortal(floating, document.body);
};

export default Chatbot;


