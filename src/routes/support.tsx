import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import {
  Headphones,
  MessageCircle,
  Mail,
  Search,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Leaf,
  User,
  ChevronDown,
  Send,
  Clock,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Customer Support — HalliFresh" },
      {
        name: "description",
        content:
          "Talk to the HalliFresh care team. Track orders, request refunds, report missing items, or chat with us 24×7.",
      },
      { property: "og:title", content: "Customer Support — HalliFresh" },
      {
        property: "og:description",
        content:
          "Talk to the HalliFresh care team. Track orders, request refunds, report missing items, or chat with us 24×7.",
      },
    ],
  }),
  component: SupportRouter,
});

import { useIsNative } from "@/lib/use-native";
import { MobileHelp } from "@/components/native/MobileHelp";

function SupportRouter() {
  const isNative = useIsNative();
  if (isNative) return <MobileHelp />;
  return <SupportPage />;
}

const CATEGORIES = [
  { icon: Package, label: "Order issues", desc: "Missing, delayed or wrong items", href: "/orders" },
  { icon: Truck, label: "Delivery & tracking", desc: "Where's my order?", href: "/orders" },
  { icon: RotateCcw, label: "Refunds & returns", desc: "Status & how it works", href: "#refunds" },
  { icon: CreditCard, label: "Payments & wallet", desc: "Failed payments, refunds", href: "#payments" },
  { icon: User, label: "Account & address", desc: "Profile, login, addresses", href: "/account" },
  { icon: Leaf, label: "Product quality", desc: "Freshness & quality concerns", href: "#quality" },
];

const FAQS = [
  {
    cat: "Orders",
    q: "How do I track my order?",
    a: "Open Orders, tap the active order, and you'll see a live timeline updated by the delivery partner.",
  },
  {
    cat: "Quality",
    q: "An item arrived spoilt or damaged. What now?",
    a: "Open the order, tap 'Report an issue' and pick 'Quality/damaged'. We refund within 24 hours, no questions asked.",
  },
  {
    cat: "Orders",
    q: "Can I change my delivery address after placing the order?",
    a: "Possible only before the order is packed. Chat with us within 5 minutes of placing the order.",
  },
  {
    cat: "Payments",
    q: "My payment failed but the amount was deducted.",
    a: "Bank-side debits without confirmation auto-refund in 3–5 working days. Share the txn ID via chat if it's later than that.",
  },
  {
    cat: "Refunds",
    q: "How long do refunds take?",
    a: "5–7 working days back to the source. COD refunds go to the bank account you share with us.",
  },
  {
    cat: "Delivery",
    q: "Do you deliver to my pincode?",
    a: "Enter your pincode at checkout to check serviceability — we cover 200+ pin codes across the city.",
  },
  {
    cat: "Account",
    q: "How do I delete my HalliFresh account?",
    a: "Go to Account → Privacy → Delete account. Pending orders must be completed or cancelled first.",
  },
  {
    cat: "Quality",
    q: "What's your freshness promise?",
    a: "Produce is sourced daily from local farms and quality-checked at our warehouse. Not fresh? Full refund + free replacement.",
  },
];

function SupportPage() {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [topic, setTopic] = useState("Order issue");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(t) || f.a.toLowerCase().includes(t) || f.cat.toLowerCase().includes(t),
    );
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill name, email and message");
      return;
    }
    toast.success("Ticket received. We'll reply within 2 hours.");
    setName(""); setEmail(""); setOrderId(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/15 via-background to-brand/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-pop">
            <Headphones className="h-3.5 w-3.5" /> 24×7 Customer Care
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-5xl">
            How can we help you today?
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Search our help articles, chat with a real human, or raise a ticket — we typically reply within 2 hours.
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: refund, missing item, COD…"
              className="h-12 w-full rounded-full border bg-card pl-11 pr-4 text-sm shadow-card outline-none focus:ring-focus"
            />
          </div>

          {/* Quick contact strip */}
          <div className="mt-5 flex flex-wrap gap-2">
            <QuickAction href="mailto:support@hallifresh.com" icon={<Mail className="h-4 w-4" />} label="support@hallifresh.com" />
            <QuickAction href="mailto:HallifreshVeggies@gmail.com" icon={<Mail className="h-4 w-4" />} label="HallifreshVeggies@gmail.com" />
            <QuickAction
              href="https://www.instagram.com/hallifreshveggies?igsh=bzNxemw0ZWZybXVh"
              icon={<Instagram className="h-4 w-4" />}
              label="Instagram"
              external
            />
            <QuickAction
              href="https://www.facebook.com/share/1DoTqcfpGd/"
              icon={<Facebook className="h-4 w-4" />}
              label="Facebook"
              external
            />
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORIES.map((c) => {
            const isInternal = c.href.startsWith("/");
            const Inner = (
              <>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-bold">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </>
            );
            return isInternal ? (
              <Link
                key={c.label}
                to={c.href}
                className="group flex flex-col rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
              >
                {Inner}
              </Link>
            ) : (
              <a
                key={c.label}
                href={c.href}
                className="group flex flex-col rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
              >
                {Inner}
              </a>
            );
          })}
        </div>
      </section>

      {/* STATUS + PROMISE BAR */}
      <section className="mx-auto mt-8 max-w-6xl px-4">
        <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-card md:grid-cols-3">
          <Stat icon={<CheckCircle2 className="h-5 w-5 text-success" />} title="All systems operational" sub="Orders, payments, delivery — running fine" />
          <Stat icon={<Clock className="h-5 w-5 text-primary" />} title="Avg. reply time" sub="Under 2 hours · 7am – 11pm IST" />
          <Stat icon={<ShieldCheck className="h-5 w-5 text-brand" />} title="100% freshness promise" sub="Not happy? Full refund, no questions" />
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">Frequently asked</h2>
            <p className="text-sm text-muted-foreground">Quick answers to the most common questions.</p>
          </div>
          <Link to="/help" className="hidden text-sm font-bold text-primary hover:underline md:inline">
            See all articles →
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
              No articles match "{q}". Try a different keyword or chat with us below.
            </div>
          )}
          {filtered.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border bg-card shadow-card">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {f.cat}
                    </span>
                    <span className="text-sm font-bold">{f.q}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <div className="border-t px-5 py-4 text-sm text-muted-foreground">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* TICKET FORM + SIDEBAR */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Raise a support ticket</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Replies go to your email. Average response time: 2 hours.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Your name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="Jane Doe" />
              </Field>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="jane@example.com" />
              </Field>
              <Field label="Order ID (optional)">
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="#HF-12345" />
              </Field>
              <Field label="Topic">
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus">
                  <option>Order issue</option>
                  <option>Refund request</option>
                  <option>Quality / damaged item</option>
                  <option>Payment problem</option>
                  <option>Account / login</option>
                  <option>Feedback / other</option>
                </select>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Describe the issue">
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus" placeholder="Tell us what happened — be as specific as possible." />
              </Field>
            </div>
            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95">
              <Send className="h-4 w-4" /> Submit ticket
            </button>
          </form>

          <aside className="space-y-3">
            <ContactCard icon={<Mail className="h-5 w-5" />} title="Support email" detail="support@hallifresh.com" sub="Reply within 24h" href="mailto:support@hallifresh.com" />
            <ContactCard icon={<Mail className="h-5 w-5" />} title="Company email" detail="HallifreshVeggies@gmail.com" sub="For business & press" href="mailto:HallifreshVeggies@gmail.com" />
            <ContactCard icon={<Instagram className="h-5 w-5" />} title="Instagram" detail="@hallifreshveggies" sub="DM us — replies in hours" href="https://www.instagram.com/hallifreshveggies?igsh=bzNxemw0ZWZybXVh" external />
            <ContactCard icon={<Facebook className="h-5 w-5" />} title="Facebook" detail="HalliFresh Veggies" sub="Follow & message us" href="https://www.facebook.com/share/1DoTqcfpGd/" external />
            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-brand/10 p-4 shadow-card">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Partner support</div>
              <div className="mt-1 text-sm font-bold">Are you a restaurant or rider?</div>
              <Link to="/partner" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                Go to partner help <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}

function QuickAction({ href, icon, label, external }: { href: string; icon: React.ReactNode; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-bold shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
    >
      {icon}
      {label}
    </a>
  );
}

function Stat({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
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

function ContactCard({
  icon,
  title,
  detail,
  sub,
  href,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  sub: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-0.5 text-sm font-bold">{detail}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </a>
  );
}
