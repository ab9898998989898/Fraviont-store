"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";
import { magneticButton } from "@/lib/gsap/animations/productCard";
import { MessageCircle, X, Send } from "lucide-react";
import { api } from "@/trpc/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_SUGGESTIONS = [
  "What's your best-selling perfume?",
  "Help me find a gift",
  "Tell me about your ingredients",
];

const SESSION_ID =
  typeof window !== "undefined"
    ? (localStorage.getItem("fraviont-session") ??
      (() => {
        const id = Math.random().toString(36).slice(2);
        localStorage.setItem("fraviont-session", id);
        return id;
      })())
    : "server";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = api.ai.chat.useMutation({
    onSuccess: (data) => {
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
  });

  useGSAP(
    () => {
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: EASE.elastic, delay: 1 }
        );
        magneticButton(buttonRef.current);
      }
    },
    { scope: buttonRef }
  );

  useGSAP(
    () => {
      if (!panelRef.current) return;
      if (open) {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: EASE.enter }
        );
      }
    },
    { dependencies: [open] }
  );

  function handleSend() {
    const msg = input.trim();
    if (!msg || chatMutation.isPending) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    chatMutation.mutate({ message: msg, sessionId: SESSION_ID });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[150] w-14 h-14 bg-gold-warm text-obsidian flex items-center justify-center hover:bg-gold-bright transition-colors duration-300 shadow-lg"
        aria-label="Open chat with Sophia"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-[149] w-80 sm:w-96 bg-[#111111] border border-[#1E1E1E] flex flex-col"
          style={{ height: 480 }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1E1E1E] flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-warm/20 border border-gold-antique flex items-center justify-center">
              <span className="text-gold-warm text-xs font-accent">S</span>
            </div>
            <div>
              <p className="text-ivory text-sm font-sans font-light">Sophia</p>
              <p className="text-ash text-[10px] font-sans">Your luxury concierge</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-parchment text-sm font-sans font-light leading-relaxed">
                  Hello, I&apos;m Sophia. How can I help you discover something beautiful today?
                </p>
                <div className="space-y-2">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        setTimeout(handleSend, 0);
                      }}
                      className="block w-full text-left text-xs font-sans text-ash border border-iron px-3 py-2 hover:border-gold-antique hover:text-parchment transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm font-sans font-light leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gold-warm text-obsidian"
                      : "bg-[#1a1a1a] text-parchment border border-[#2A2A2A]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[#2A2A2A] px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-gold-warm rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#1E1E1E] flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Sophia anything..."
              rows={1}
              className="flex-1 bg-transparent border border-[#2A2A2A] text-ivory text-sm font-sans font-light px-3 py-2 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="text-gold-warm hover:text-gold-bright transition-colors disabled:opacity-40 flex-shrink-0"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
