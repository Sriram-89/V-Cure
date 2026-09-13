import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProfileLinkCard, SubscriptionLinkCard } from "@/components/settings/link-out-cards";
import { LanguageSettingsSection } from "@/components/settings/language-settings-section";
import { ThemeSettingsSection } from "@/components/settings/theme-settings-section";
import { UnitsSettingsSection } from "@/components/settings/units-settings-section";
import { NotificationPreferencesSection } from "@/components/settings/notification-preferences-section";
import { PrivacyConsentSection } from "@/components/settings/privacy-consent-section";
import { SecuritySettingsSection } from "@/components/settings/security-settings-section";
import { SupportSection, AboutSection } from "@/components/settings/support-about-sections";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Container className="max-w-3xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage your account, preferences, and privacy.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <ProfileLinkCard />
        <LanguageSettingsSection />
        <ThemeSettingsSection />
        <UnitsSettingsSection />
        <NotificationPreferencesSection />
        <PrivacyConsentSection />
        <SecuritySettingsSection />
        <SubscriptionLinkCard />
        <SupportSection />
        <AboutSection />
      </div>
    </Container>
  );
}
