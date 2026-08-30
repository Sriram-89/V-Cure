"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, HeartPulse } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Conditions we support", href: "#conditions" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <HeartPulse className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>V-Cure</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href={ROUTES.REGISTER}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {isOpen ? (
        <div className="border-t border-border bg-surface md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href={ROUTES.LOGIN} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER} className="flex-1">
                <Button size="sm" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
