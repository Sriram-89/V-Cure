"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    question: "Does V-Cure replace my doctor?",
    answer:
      "No. V-Cure supports the decisions you make with your doctor by organizing your medical history and flagging risks — it does not diagnose or prescribe."
  },
  {
    question: "How is my medical data protected?",
    answer:
      "Reports and profile data are encrypted at rest and in transit, and only used to generate your own recommendations."
  },
  {
    question: "What happens if a recommendation conflicts with my allergies?",
    answer:
      "The safety layer checks every recommendation against your allergies, conditions, and medications before it is shown, and blocks or flags anything unsafe."
  },
  {
    question: "Can I cancel Premium anytime?",
    answer:
      "Yes. You can cancel from Settings at any time and keep access until the end of your current billing period."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface-muted py-20">
      <Container className="max-w-3xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-10 divide-y divide-border rounded-card border border-border bg-surface">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-medium text-text-primary">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-text-secondary transition-transform",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <p className="px-6 pb-5 text-sm text-text-secondary">{faq.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
