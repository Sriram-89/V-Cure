import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "V-Cure — Personalized Health & Nutrition",
    template: "%s | V-Cure"
  },
  description:
    "V-Cure builds a personalized nutrition and lifestyle plan around your medical history, safely and clearly."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
