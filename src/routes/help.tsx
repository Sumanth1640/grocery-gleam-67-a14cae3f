import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { LifeBuoy, MessageCircle, Phone, Mail, ChevronDown, Package, CreditCard, Truck, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — hallifresh" },
      { name: "description", content: "Get help with your orders, refunds, payments, deliveries and account." },
    ],
  }),
  component: HelpPage,
});

const TOPICS = [
  { icon: Package, label: "Order issues", href: "/orders" },
  { icon: Truck, label: "Delivery status", href: "/orders" },
  { icon: RotateCcw, label: "Refunds & returns", href: "#refunds" },
  { icon: CreditCard, label: "Payments", href: "#payments" },
];

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Go to Orders, open the order, and you'll see a live status timeline that updates as your order is packed, dispatched and delivered.",
  },
  {
    q: "What if items are missing or damaged?",
    a: "Open the order from Orders, tap 'Need help?' and select 'Missing/damaged item'. We'll process a refund within 24 hours.",
  },
  {
    q: "Can I change my delivery address after placing an order?",
    a: "Address changes are possible only before the order is packed. Reach out via chat below within 5 minutes of placing the order.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, all major credit & debit cards, net banking, and cash on delivery (COD) on selected pin codes.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds are credited back to the original payment method within 5–7 working days. COD refunds are sent to your bank account.",
  },
  {
    q: "Do you deliver to my area?",
    a: "Enter your pincode at checkout to confirm serviceability. We currently deliver across 200+ pin codes in India.",
  },
  {
    q: "How is the food kept hot during delivery?",
    a: "All food orders are sealed in insulated bags by our delivery partners and reach you within 30–35 minutes on average.",
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can be cancelled for free until they're packed. After dispatch, cancellation isn't possible but you can request a refund if there's an issue.",
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("We've received your message. We'll get back within 24 hours.");
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-brand/10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            <LifeBuoy className="h-3.5 w-3.5" /> We're here to help
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">
            Help & Support
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Browse common topics, read FAQs, or reach out to our team — we usually reply within 2 hours.
          </p>
        </div>
      </div>

      {/* Topic shortcuts */}
      <section className="mx-auto -mt-6 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TOPICS.map((t) => (
            <Link
              key={t.label}
              to={t.href}
              className="group flex flex-col items-start gap-2 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold">{t.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-extrabold">Frequently asked</h2>
        <div className="mt-5 grid gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border bg-card shadow-card">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-bold hover:bg-secondary/50"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t px-5 py-4 text-sm text-muted-foreground">{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Send us a message</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">We reply within 2 working hours.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Your name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="Jane Doe" />
              </Field>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="jane@example.com" />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="How can we help?">
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="Tell us what happened…" />
              </Field>
            </div>
            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95">
              <Send className="h-4 w-4" /> Send message
            </button>
          </form>

          <aside className="space-y-3">
            <ContactCard icon={<Phone className="h-5 w-5" />} title="Call us" detail="+91 1800 123 456" sub="Mon–Sun · 7am – 11pm" />
            <ContactCard icon={<Mail className="h-5 w-5" />} title="Email" detail="support@hallifresh.com" sub="Reply within 24h" />
            <ContactCard icon={<MessageCircle className="h-5 w-5" />} title="Live chat" detail="Available 24×7" sub="Tap the chat bubble" />
          </aside>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function ContactCard({ icon, title, detail, sub }: { icon: React.ReactNode; title: string; detail: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-0.5 text-sm font-bold">{detail}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
