import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/constants/routes";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" }
    ]
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: ROUTES.LOGIN },
      { label: "Create account", href: ROUTES.REGISTER }
    ]
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href={ROUTES.HOME} className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
              </span>
              V-Cure
            </Link>
            <p className="mt-4 max-w-xs text-sm text-text-secondary">
              Personalized nutrition and lifestyle plans, built around your
              medical history.
            </p>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.heading}>
              <h4 className="text-sm font-semibold text-text-primary">{column.heading}</h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-text-secondary">
          © {new Date().getFullYear()} V-Cure. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
