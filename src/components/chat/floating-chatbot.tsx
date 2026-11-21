"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Send,
  X,
  Bot,
  RotateCcw,
  LoaderCircle,
  MessageCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/core/client";
import ReactMarkdown from "react-markdown";

interface Service {
  _id: string;
  serviceName: string;
  category?: string;
  price?: number;
  location?: string;
  images?: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Hello! 👋 I'm your WedPlan AI Wedding Assistant. Tell me what services you're looking for and I'll find the best matches for your celebration!",
  },
];

const SUGGESTIONS = [
  "Photographers under $3000",
  "Top wedding venues",
  "Catering & dining packages",
  "Bridal beauty & makeup",
];

function ServiceCard({ service }: { service: Service }) {
  const img =
    service.images?.[0] ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80";

  return (
    <Link
      href={`/services/${service._id}`}
      className="flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xs transition hover:border-primary/50 hover:shadow-md group not-prose no-underline"
    >
      <div className="relative size-14 rounded-lg overflow-hidden shrink-0 bg-secondary">
        <Image
          src={img}
          alt={service.serviceName}
          fill
          sizes="56px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {service.serviceName}
          </h4>
          {service.price !== undefined && (
            <span className="text-xs font-semibold text-primary shrink-0">
              ${service.price}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="truncate">{service.category}</span>
          {service.location && (
            <>
              <span>•</span>
              <span className="truncate flex items-center gap-0.5">
                <MapPin className="size-2.5 shrink-0" />
                {service.location}
              </span>
            </>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
          <span>View Service</span>
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [catalog, setCatalog] = useState<Service[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await apiFetch("/ai-chat", {
      method: "POST",
      body: JSON.stringify({ userMessage: text }),
    });

    const data = await res.json();
    if (Array.isArray(data.services)) {
      setCatalog(data.services);
    }

    const reply = data.reply || "Sorry, I could not find matching services.";
    setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const parseMessage = (content: string) => {
    const ids = Array.from(content.matchAll(/\/services\/([a-zA-Z0-9_-]+)/g), (m) => m[1]);
    const cards = catalog.filter((s) => ids.includes(s._id));

    if (cards.length === 0) {
      return { intro: content, cards: [] };
    }

    const cleanText = content
      .split("\n")
      .filter((line) => !line.includes("/services/"))
      .join("\n")
      .trim();

    return { intro: cleanText, cards };
  };

  return (
    <>
      {/* Floating Action Button (Pill Design) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="relative h-12 rounded-full px-4 sm:px-5 shadow-xl bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2.5 border border-primary/20 group"
            aria-label="Open AI Wedding Assistant"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="size-4 sm:size-5 transition-transform group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Ask AI Assistant
            </span>
          </Button>
        )}
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col w-[350px] sm:w-[400px] h-[540px] max-h-[85vh] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-primary/20 bg-primary/10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-1.5 leading-none">
                  <span>WedPlan Assistant</span>
                  <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  AI-powered wedding service finder
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages(INITIAL_MESSAGES)}
                title="Restart conversation"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((msg, index) => {
              const { intro, cards } = parseMessage(msg.content);

              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="size-3.5" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-xs whitespace-pre-wrap"
                        : "bg-muted/60 text-foreground border border-border/60 rounded-bl-xs"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <div className="space-y-2.5">
                        {intro && (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 text-xs sm:text-sm">
                            <ReactMarkdown>{intro}</ReactMarkdown>
                          </div>
                        )}
                        {cards.length > 0 && (
                          <div className="space-y-2">
                            {cards.map((service) => (
                              <ServiceCard key={service._id} service={service} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs pl-9">
                <LoaderCircle className="size-4 animate-spin text-primary" />
                <span>Searching wedding catalog...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
                <MessageCircle className="size-3" />
                <span>Suggested searches:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="text-[11px] rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-border p-3 bg-background flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for wedding services..."
              disabled={loading}
              className="flex-1 h-9 rounded-full border border-input bg-muted/40 px-3.5 text-xs sm:text-sm outline-none focus:border-ring focus:bg-background transition-colors"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="size-9 rounded-full p-0 shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
