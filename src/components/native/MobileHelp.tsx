import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Search,
  ChevronDown,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  User,
  Leaf,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Headphones,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

type Topic = {
  icon: typeof Package;
  label: string;
  desc: string;
  href?: string;
};

const TOPICS: Topic[] = [
  { icon: Package, label: "Orders", desc: "Track, edit, cancel", href: "/orders" },
  { icon: Truck, label: "Delivery", desc: "ETA & address", href: "/orders" },
  { icon: RotateCcw, label: "Refunds", desc: "Status & timing" },
  { icon: CreditCard, label: "Payments", desc: "Failed, retries" },
  { icon: User, label: "Account", desc: "Login & profile", href: "/account" },
  { icon: Leaf, label: "Quality", desc: "Freshness promise" },
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
    q: "How do I delete my account?",
    a: "Go to Account → Privacy → Delete account. Pending orders must be completed or cancelled first.",
  },
];

export function MobileHelp() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return FAQS;
    return FAQS.filter(
      (f) =>
        f.q.toLowerCase().includes(t) ||
        f.a.toLowerCase().includes(t) ||
        f.cat.toLowerCase().includes(t),
    );
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill name, email and message");
      return;
    }
    toast.success("Ticket received. We'll reply within 2 hours.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-white pb-28" style={FONT}>
      {/* Hero */}
      <header
        className="relative overflow-hidden rounded-b-[2rem] px-5 pt-10 pb-6 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.30 0.05 145) 0%, oklch(0.22 0.04 150) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
            <Headphones className="h-3 w-3" /> 24×7
          </div>
          <div className="w-10" />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight">
          How can we
          <br />
          <span style={{ color: GREEN, filter: "brightness(1.4)" }}>help?</span>
        </h1>
        <p className="mt-2 text-[13px] text-white/70">
          Search articles, browse topics, or message our team.
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: refund, missing item, COD…"
            className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </div>
      </header>

      {/* Topic grid */}
      <section className="mt-6 px-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Browse topics
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {TOPICS.map((t) => {
            const inner = (
              <>
                <div
                  className="grid h-10 w-10 place-items-center rounded-2xl"
                  style={{ background: "oklch(0.95 0.04 145)", color: GREEN }}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="mt-2 text-[12px] font-extrabold text-zinc-900">
                  {t.label}
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight">{t.desc}</div>
              </>
            );
            return t.href ? (
              <Link
                key={t.label}
                to={t.href}
                className="flex flex-col rounded-2xl border border-zinc-100 bg-white p-3"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={t.label}
                className="flex flex-col rounded-2xl border border-zinc-100 bg-white p-3"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-7 px-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Frequently asked
        </h2>
        <div className="mt-3 grid gap-2">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-[12px] text-zinc-500">
              No articles match "{q}".
            </div>
          )}
          {filtered.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-zinc-100 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center gap-2 px-4 py-3.5 text-left"
                >
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: "oklch(0.95 0.04 145)", color: GREEN }}
                  >
                    {f.cat}
                  </span>
                  <span className="flex-1 text-[13px] font-bold text-zinc-900">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-100 px-4 py-3 text-[12px] text-zinc-600">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact row */}
      <section className="mt-7 px-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Reach us
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Reach
            href="tel:+911800123456"
            icon={<Phone className="h-4 w-4" />}
            title="Call"
            sub="7am–11pm IST"
          />
          <Reach
            href="mailto:support@hallifresh.com"
            icon={<Mail className="h-4 w-4" />}
            title="Email"
            sub="Reply in 24h"
          />
          <Reach
            href="https://www.instagram.com/hallifreshveggies?igsh=bzNxemw0ZWZybXVh"
            icon={<Instagram className="h-4 w-4" />}
            title="Instagram"
            sub="DM us"
            external
          />
          <Reach
            href="https://www.facebook.com/share/1DoTqcfpGd/"
            icon={<Facebook className="h-4 w-4" />}
            title="Facebook"
            sub="Message"
            external
          />
        </div>
      </section>

      {/* Ticket form */}
      <section className="mt-7 px-5">
        <div className="rounded-3xl border border-zinc-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" style={{ color: GREEN }} />
            <h2 className="text-sm font-extrabold text-zinc-900">Send us a message</h2>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Average response time: 2 hours.
          </p>

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <Field label="Your name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                placeholder="jane@example.com"
              />
            </Field>
            <Field label="Describe the issue">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                placeholder="Tell us what happened…"
              />
            </Field>
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-white"
              style={{ background: GREEN }}
            >
              <Send className="h-4 w-4" /> Submit ticket
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      {children}
    </label>
  );
}

function Reach({
  href,
  icon,
  title,
  sub,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3"
    >
      <div
        className="grid h-10 w-10 place-items-center rounded-2xl"
        style={{ background: "oklch(0.95 0.04 145)", color: GREEN }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-extrabold text-zinc-900">{title}</div>
        <div className="text-[10px] text-zinc-500">{sub}</div>
      </div>
    </a>
  );
}
