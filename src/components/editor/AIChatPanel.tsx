import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, Trash2 } from "lucide-react";
import { getChatbotResponse } from "@/services/aiService";
import { useResume } from "@/hooks";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "How can I improve my summary?",
  "What skills am I missing?",
  "Rewrite my experience bullets",
  "Give me interview questions",
  "Rate my resume out of 10",
];

const AIChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! I'm **CareerBot** 🤖 — your AI career coach.\n\nI can see your resume in real-time. Ask me anything:\n- \"How can I improve my experience section?\"\n- \"What keywords am I missing for this role?\"\n- \"Help me write a better summary\"\n- \"Prepare me for interviews\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resumeData } = useResume();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(messageText, resumeData);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "bot",
          text: "Sorry, I'm having trouble right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: "Chat cleared! How can I help you with your resume?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-like rendering (bold, bullet points, line breaks)
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      let processed = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="color:#4ade80">$1</strong>'
      );
      // Inline code
      processed = processed.replace(
        /`(.*?)`/g,
        '<code style="background:rgba(74,222,128,0.12);padding:1px 5px;border-radius:4px;font-size:0.85em;color:#86efac">$1</code>'
      );
      // Bullet points
      if (processed.startsWith("- ")) {
        processed = `<span style="color:#4ade80;margin-right:6px">•</span>${processed.slice(2)}`;
      }

      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group"
        style={{
          background: isOpen
            ? "rgba(239,68,68,0.2)"
            : "linear-gradient(135deg, #059669 0%, #4ade80 100%)",
          border: `1px solid ${isOpen ? "rgba(239,68,68,0.4)" : "rgba(74,222,128,0.5)"}`,
          boxShadow: isOpen
            ? "0 4px 24px rgba(239,68,68,0.3)"
            : "0 4px 24px rgba(74,222,128,0.35), 0 0 60px rgba(74,222,128,0.1)",
        }}
      >
        {isOpen ? (
          <X size={22} style={{ color: "#f87171" }} />
        ) : (
          <MessageSquare
            size={22}
            style={{ color: "#fff" }}
            className="group-hover:scale-110 transition-transform"
          />
        )}
        {/* Notification dot for new users */}
        {!isOpen && messages.length <= 1 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
            style={{
              background: "#4ade80",
              border: "2px solid #0D1512",
            }}
          />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className="fixed bottom-24 right-6 z-[70] flex flex-col transition-all duration-300"
        style={{
          width: "400px",
          height: "560px",
          borderRadius: "20px",
          background: "rgba(10,17,14,0.97)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px 20px 0 0",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(5,150,105,0.2) 100%)",
                border: "1px solid rgba(74,222,128,0.3)",
              }}
            >
              <Sparkles size={16} style={{ color: "#4ade80" }} />
            </div>
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "#F0FDF4" }}
              >
                CareerBot
              </h3>
              <p
                className="text-[10px] font-medium"
                style={{ color: "rgba(74,222,128,0.7)" }}
              >
                AI Career Coach • Online
              </p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg transition-all"
            style={{ color: "rgba(209,250,229,0.35)" }}
            title="Clear chat"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(209,250,229,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(209,250,229,0.35)";
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#F0FDF4",
                        borderBottomRightRadius: "6px",
                      }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(209,250,229,0.85)",
                        borderBottomLeftRadius: "6px",
                      }
                }
              >
                {msg.role === "bot" ? renderMarkdown(msg.text) : msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderBottomLeftRadius: "6px",
                }}
              >
                <Loader2
                  size={14}
                  className="animate-spin"
                  style={{ color: "#4ade80" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(209,250,229,0.5)" }}
                >
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (show only when few messages) */}
        {messages.length <= 2 && !isLoading && (
          <div
            className="px-4 pb-2 flex flex-wrap gap-1.5"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.18)",
                  color: "rgba(74,222,128,0.8)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(74,222,128,0.15)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
                  e.currentTarget.style.color = "#4ade80";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(74,222,128,0.08)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.18)";
                  e.currentTarget.style.color = "rgba(74,222,128,0.8)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div
          className="px-4 pb-4 pt-2 flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your resume..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(209,250,229,0.30)]"
              style={{ color: "#F0FDF4" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg transition-all disabled:opacity-30"
              style={{
                background: input.trim()
                  ? "rgba(74,222,128,0.15)"
                  : "transparent",
                color: input.trim() ? "#4ade80" : "rgba(209,250,229,0.3)",
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatPanel;
