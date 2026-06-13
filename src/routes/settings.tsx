import { createFileRoute, Link } from "@tanstack/react-router";
import { useIsNative } from "@/lib/use-native";
import { MobileSettings } from "@/components/native/MobileSettings";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — hallifresh" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const isNative = useIsNative();
  if (isNative) return <MobileSettings />;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile, addresses, and preferences from the{" "}
          <Link to="/account" className="font-semibold text-primary hover:underline">
            account page
          </Link>
          .
        </p>
        <div className="mt-6">
          <MobileSettings />
        </div>
      </div>
      <Footer />
    </div>
  );
}
