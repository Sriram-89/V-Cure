"use client";

import { useState } from "react";
import { Lightbulb, ArrowUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { VCureSymbolLogo } from "@/components/ui/vcure-logo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useTranslation } from "@/hooks/use-translation";

const SUGGESTED_PROMPTS_EN = [
  "Best breakfast for diabetes?",
  "Healthy snack under ₹50",
  "Can I eat mango with PCOS?",
  "How much water should I drink?",
  "Explain glycemic index in simple words"
];

const SUGGESTED_PROMPTS_TE = [
  "డయాబెటిస్ బాధితులకు ఉత్తమ అల్పాహారం ఏది?",
  "₹50 లోపు ఆరోగ్యకరమైన స్నాక్",
  "తాగవలసిన నీటి పరిమాణం ఎంత?",
  "గ్లైసెమిక్ ఇండెక్స్ గురించి చెప్పండి"
];

interface ChatMessage {
  sender: "user" | "coach";
  text: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { t, language } = useTranslation();

  const draft = useOnboardingStore((state) => state.draft);
  const isTelugu = language === "te";

  const category = draft.diabetesCategory?.category || "PREDIABETES";
  const userAllergies = draft.allergies?.allergies || [];
  const regionalCuisine = draft.foodPreferences?.regionalCuisine || "ANDHRA";

  const suggestedPrompts = isTelugu ? SUGGESTED_PROMPTS_TE : SUGGESTED_PROMPTS_EN;

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const queryLower = text.toLowerCase();
      let coachReply = "";

      // 1. Safety Lock: Type 1 Insulin Dosing
      if (queryLower.includes("insulin") || queryLower.includes("dose") || queryLower.includes("ఇన్సులిన్")) {
        if (category === "TYPE1_DIABETES") {
          coachReply = isTelugu
            ? "⚠️ భద్రతా గమనిక: ఇన్సులిన్ డోస్ పరిమాణం మార్పులు కేవలం మీ డాక్టర్ సలహాతో మాత్రమే నిర్ణయించాలి. వి-క్యూర్ కోచ్ ఇన్సులిన్ డోస్ ఆధారిత సలహాలు ఇవ్వదు."
            : "⚠️ Safety Notice: Insulin dosage calculations and adjustments must ONLY be determined by your endocrinologist or prescribing physician. V-Cure Coach provides general nutritional guidance only and cannot calculate or adjust insulin doses.";
        } else {
          coachReply = isTelugu
            ? "ఔషధాల డోస్‌లు ఎల్లప్పుడూ మీ వైద్యుల పర్యవేక్షణలో మాత్రమే ఉండాలి. నేను తక్కువ GI ఆహార చిట్కాలను ఇవ్వగలను!"
            : "Medication and insulin regimens should always be managed strictly by your treating medical provider. I can assist with low-GI meal ideas and nutritional habit guidance!";
        }
      }
      // 2. Gestational Diabetes Context
      else if (category === "GESTATIONAL_DIABETES" && (queryLower.includes("breakfast") || queryLower.includes("diet") || queryLower.includes("అల్పాహారం"))) {
        coachReply = isTelugu
          ? "గర్భధారణ డయాబెటిస్ (Gestational Diabetes) కోసం రక్తంలో గ్లూకోజ్ స్థిరంగా ఉండటం ముఖ్యం. ఓట్స్ ఉప్మా, పన్నీర్ టిక్కా వంటి ప్రొటీన్ కలిగిన ఆహారం ఎంచుకోండి. మీ గైనకాలజిస్ట్ సలహాను పాటించండి."
          : "For Gestational Diabetes, maintaining stable blood glucose levels is key for both mother and baby. Focus on complex carbohydrates paired with lean protein (such as Vegetable Oats Upma with seeds, or Paneer Tikka). Always consult your obstetrician and diabetes educator for tailored targets.";
      }
      // 3. Breakfast guidance with Regional Context
      else if (queryLower.includes("breakfast") || queryLower.includes("అల్పాహారం")) {
        const cuisineNote = regionalCuisine === "ANDHRA" ? "Andhra Pesarattu with Ginger Chutney" : "Vegetable Oats Upma or Moong Dal Cheela";
        coachReply = isTelugu
          ? `మీ ఆరోగ్య ప్రొఫైల్ (${category.replace("_", " ")}, ${regionalCuisine} ఆహారం) ప్రకారం, ఉత్తమ అల్పాహార ఎంపికలు: ${cuisineNote}. ఇవి గ్లూకోజ్ పెరగకుండా సహాయపడతాయి.`
          : `Based on your profile (${category.replace("_", " ")}, ${regionalCuisine} cuisine preference), ideal breakfast choices include high-protein, high-fiber options like ${cuisineNote}. These slow down glucose absorption and maintain steady energy.`;
      }
      // 4. Snack guidance with Allergy Check
      else if (queryLower.includes("snack") || queryLower.includes("స్నాక్")) {
        let allergyWarning = "";
        if (userAllergies.length > 0) {
          allergyWarning = isTelugu ? ` (అలర్జీ భద్రత: ${userAllergies.join(", ")} నివారించండి)` : ` (Allergy Safety: Strictly avoiding ${userAllergies.join(", ")})`;
        }
        coachReply = isTelugu
          ? `₹50 లోపు తక్కువ GI ఉన్న స్నాక్స్: వేయించిన శనగలు (Roasted Chana), మొలకెత్తిన గింజల సలాడ్${allergyWarning}.`
          : `Recommended low-GI snacks under ₹50 include Roasted Chana, Sprouts Salad with Lemon, or Unsweetened Curd with Chia Seeds${allergyWarning}. They prevent glycemic spikes between meals.`;
      }
      // 5. Hydration
      else if (queryLower.includes("water") || queryLower.includes("నీటి")) {
        coachReply = isTelugu
          ? "రోజుకు 8 నుండి 10 గ్లాసుల (2.5 – 3.0 లీటర్లు) మంచి నీరు తాగడం ఆరోగ్యానికి చాలా మంచిది."
          : "Aim for 8 to 10 glasses (2.5 – 3.0 Liters) of fresh water daily. Adequate hydration improves renal clearance, metabolic rate, and satiety.";
      }
      // 6. Fallback General Guidance
      else {
        let allergyContext = userAllergies.length > 0 ? (isTelugu ? ` (${userAllergies.join(", ")} అలర్జీ నియమాలను పాటిస్తూ)` : ` while respecting your ${userAllergies.join(", ")} allergy constraints`) : "";
        coachReply = isTelugu
          ? `నేను మీ ${category.replace("_", " ")} ఆరోగ్య ప్రణాళికకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను${allergyContext}. ఎక్కువ పీచు పదార్థాలు (fiber), కూరగాయలు మరియు ప్రొటీన్ తీసుకోవడానికి ప్రాధాన్యత ఇవ్వండి.`
          : `I am here to guide your nutrition for ${category.replace("_", " ")}${allergyContext}. Focus on high-fiber vegetables, whole grains, and lean proteins to maintain steady metabolic wellness.`;
      }

      setMessages((prev) => [...prev, { sender: "coach", text: coachReply }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-w-0 w-full">
      {/* Top Header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 shadow-xs">
        <Container className="max-w-md px-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 p-1.5 border border-emerald-100 shadow-xs">
              <VCureSymbolLogo className="h-full w-full" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900">
                {t.coachTitle}
              </h1>
              <p className="text-[11px] font-medium text-gray-400">
                {t.coachSubtitle}
              </p>
            </div>
          </div>
          <a
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shrink-0 shadow-xs hover:bg-slate-700 transition-all"
            aria-label="Profile"
          >
            S
          </a>
        </Container>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-w-0 w-full">
        <Container className="max-w-md px-0 space-y-4">
          {/* Welcome Green Banner */}
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-center shadow-xs">
            <h2 className="text-lg font-extrabold text-gray-900">
              {isTelugu ? "నమస్కారం! నేను మీ ఆహార ప్రణాళిక కోచ్." : "Hi! I'm your nutrition coach."}
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-600 leading-relaxed">
              {isTelugu ? "ఆహారం, అలవాట్లు లేదా ఆరోగ్య లక్ష్యాల గురించి నన్ను అడగండి." : "Ask me anything about food, habits, or your health goals."}
            </p>

            {/* Quick Prompt Pills */}
            {messages.length === 0 ? (
              <div className="mt-4 space-y-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendPrompt(prompt)}
                    className="w-full flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-gray-800 shadow-xs hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
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
            <div className="space-y-3 pt-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-xs ${
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
                    {t.loading}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Container>
      </div>

      {/* Pinned Bottom Chat Input */}
      <div className="shrink-0 bg-white border-t border-gray-100 p-3 shadow-lg z-40">
        <Container className="max-w-md px-0 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendPrompt(inputQuery)}
            placeholder={t.askCoachPlaceholder}
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="button"
            onClick={() => handleSendPrompt(inputQuery)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-all shadow-xs shrink-0"
          >
            <ArrowUp className="h-5 w-5 stroke-[2.5]" />
          </button>
        </Container>
      </div>
    </div>
  );
}

