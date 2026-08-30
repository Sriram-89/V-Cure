import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HealthConditions } from "@/components/landing/health-conditions";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "V-Cure — Personalized Health & Nutrition"
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HealthConditions />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
