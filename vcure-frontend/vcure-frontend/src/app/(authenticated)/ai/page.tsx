"use client";

import { useState } from "react";
import { Sparkles, Lightbulb, ArrowUp } from "lucide-react";
import { Container } from "@/components/ui/container";

const SUGGESTED_PROMPTS = [
  "Best breakfast for diabetes?",
  "Healthy snack under ₹50",
  "Can I eat mango with PCOS?",
  "How much water should I drink?",
  "Explain glycemic index in simple words"
];

interface ChatMessage {
  sender: "user" | "coach";
  text: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      let coachReply = "I recommend high-fiber, low-glycemic foods to maintain balanced blood sugar and support your health goals.";
      if (text.toLowerCase().includes("diabetes")) {
        coachReply = "For Type 2 Diabetes, opt for high-protein, high-fiber Indian breakfasts like Moong Dal Cheela or Vegetable Oats Upma with zero added sugar.";
      } else if (text.toLowerCase().includes("snack")) {
        coachReply = "Sprouts Salad or Roasted Chana are budget-friendly, high-protein snacks under ₹50 that keep you full longer.";
      } else if (text.toLowerCase().includes("water")) {
        coachReply = "Aim for 8 to 10 glasses (2.5 - 3 Liters) of water daily. Staying hydrated improves digestion and metabolic efficiency.";
      }

      setMessages((prev) => [...prev, { sender: "coach", text: coachReply }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-4 shadow-xs">
        <Container className="max-w-md flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">V-Cure Coach</h1>
            <p className="text-[11px] font-medium text-gray-400">
              Educational only — not medical advice
            </p>
          </div>
        </Container>
      </div>

      <Container className="max-w-md px-4 py-6 space-y-4">
        {/* Welcome Green Banner */}
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 text-center shadow-xs">
          <h2 className="text-xl font-extrabold text-gray-900">Hi! I'm your nutrition coach.</h2>
          <p className="mt-2 text-xs font-medium text-gray-600 leading-relaxed">
            Ask me anything about food, habits, or your health goals.
          </p>

          {/* Quick Prompt Pills */}
          {messages.length === 0 ? (
            <div className="mt-5 space-y-2.5">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(prompt)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-800 shadow-xs hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
                >
                  <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Messages Stream */}
        {messages.length > 0 ? (
          <div className="space-y-3 pt-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white border border-gray-100 p-3 text-xs font-bold text-emerald-600 animate-pulse">
                  V-Cure Coach is thinking...
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Container>

      {/* Sticky Bottom Chat Input */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 p-3 shadow-lg">
        <Container className="max-w-md flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendPrompt(inputQuery)}
            placeholder="Ask about nutrition, meals, habits..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="button"
            onClick={() => handleSendPrompt(inputQuery)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300 text-emerald-900 hover:bg-emerald-400 font-bold transition-all shadow-xs"
          >
            <ArrowUp className="h-5 w-5 stroke-[2.5]" />
          </button>
        </Container>
      </div>
    </div>
  );
}
