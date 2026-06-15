"use client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, Check, Star, ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";
import { siteData } from "@/data/siteData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VenueIQ — Review Intelligence Agency for Hospitality" },
      {
        name: "description",
        content:
          "Private, interactive review intelligence reports for hospitality venues. Every Google, Yelp & TripAdvisor review analysed in 48 hours.",
      },
      { property: "og:title", content: "VenueIQ — Review Intelligence Agency" },
      {
        property: "og:description",
        content:
          "Your reviews are telling a story. Are you listening? Private, interactive intelligence reports for venues.",
      },
    ],
  }),
  component: Landing,
});

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all"
      style={{
        background: scrolled ? "rgba(8,11,18,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-mono-vq font-bold tracking-wider text-lg">
          Venue<span className="text-accent-vq">IQ</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm">
          {siteData.nav.map((n) => (
            <a key={n.href} href={n.href} className="text-foreground/80 hover:text-accent-bright transition">
              {n.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="#contact" className="btn-ghost text-sm py-2 px-4">Talk to us</a>
          <a href="#contact" className="btn-filled text-sm py-2 px-4">Free Report</a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground" aria-label="Menu">
          <ChevronDown className={open ? "rotate-180 transition" : "transition"} />
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-surface border-t border-accent-vq p-5 space-y-3">
          {siteData.nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block text-foreground/90">{n.label}</a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn-filled w-full">Free Report</a>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const h = siteData.hero;
  return (
    <section className="relative min-h-[100dvh] flex items-center hero-grid overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-32 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="badge-mono inline-block" style={{ background: "var(--color-surface)", color: "var(--color-accent)" }}>
            {h.eyebrow}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.95] mt-6 max-w-5xl"
        >
          <span className="text-foreground">{h.headlineLine1}</span>
          <br />
          <span className="text-foreground">{h.headlineLine2}</span>
          <br />
          <em
            className="font-display italic"
            style={{
              background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {h.headlineLine3}
          </em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg md:text-xl text-foreground/75 mt-8 max-w-2xl leading-relaxed"
        >
          {h.body}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap gap-4 mt-10"
        >
          <a href="#contact" className="btn-filled text-base">{h.primaryCta}</a>
          <Link to="/report/$slug" params={{ slug: "bagel-shop-demo" }} className="btn-ghost text-base">
            {h.secondaryCta}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 card-vq p-6"
        >
          {h.stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl md:text-4xl text-accent-bright font-semibold">{s.value}</div>
              <div className="text-xs text-muted-vq mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-vq"
      >
        <ChevronDown />
      </motion.div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-2xl"
        >
          <span className="badge-mono text-accent-vq" style={{ background: "var(--color-surface)" }}>What we offer</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">Six ways to turn reviews into revenue.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {siteData.services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="card-vq card-vq-hover p-6 flex flex-col"
              style={s.best ? { borderColor: "var(--color-accent)", boxShadow: "0 0 30px var(--color-glow)" } : undefined}
            >
              {s.best && (
                <span className="badge-mono self-start mb-3" style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
                  Best value
                </span>
              )}
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-display text-2xl mb-2">{s.title}</h3>
              <p className="text-sm text-muted-vq mb-4">{s.description}</p>
              <ul className="space-y-1.5 text-sm mb-5 flex-1">
                {s.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check size={14} className="text-emerald-vq mt-1 shrink-0" />{f}</li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-display text-3xl text-accent-bright font-semibold">{s.price}</span>
                <span className="text-xs text-muted-vq font-mono-vq">{s.period}</span>
              </div>
              <a href="#contact" className="btn-ghost text-sm w-full">Get started</a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 max-w-2xl">
          <span className="badge-mono text-accent-vq" style={{ background: "var(--color-bg)" }}>How it works</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">From signup to strategy in 48 hours.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-accent-vq" />
          {siteData.process.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-bg border border-accent-strong mx-auto flex items-center justify-center mb-4 relative z-10">
                <span className="font-mono-vq text-accent-bright text-lg">{p.step}</span>
              </div>
              <h3 className="font-display text-xl mb-2">{p.title}</h3>
              <p className="text-sm text-muted-vq">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SampleReportTeaser() {
  return (
    <section id="report" className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="badge-mono text-accent-vq" style={{ background: "var(--color-surface)" }}>Sample report</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">This is exactly what you receive.</h2>
          <p className="text-muted-vq mt-4 max-w-xl mx-auto">
            A private, interactive URL. Seven panels of intelligence. Updated monthly.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-vq p-8 mt-10 text-left"
        >
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="font-mono-vq text-[10px] uppercase text-muted-vq">Venue under analysis</div>
              <h3 className="font-display text-3xl">The Bagel Shop</h3>
            </div>
            <div className="text-right">
              <div className="font-display text-5xl text-accent-bright">72</div>
              <div className="font-mono-vq text-[10px] text-muted-vq">health score</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            {[["Positive", "78%", "var(--color-emerald)"], ["Negative", "14%", "var(--color-coral)"], ["Need response", "23", "var(--color-accent)"]].map(([k, v, c]) => (
              <div key={k} className="bg-surface2 rounded p-3">
                <div className="font-mono-vq text-[10px] uppercase text-muted-vq">{k}</div>
                <div className="font-display text-2xl mt-1" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <Link
            to="/report/$slug"
            params={{ slug: "bagel-shop-demo" }}
            className="btn-filled mt-6"
          >
            See the full interactive report <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 max-w-2xl">
          <span className="badge-mono text-accent-vq" style={{ background: "var(--color-bg)" }}>Testimonials</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4">Operators who decided.</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {siteData.testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card-vq p-7 relative">
              <div className="absolute top-3 right-5 font-display text-7xl text-accent-vq/30 leading-none">"</div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} fill="var(--color-accent)" stroke="var(--color-accent)" />
                ))}
              </div>
              <p className="font-display italic text-xl leading-snug text-foreground/90">"{t.quote}"</p>
              <div className="mt-5 text-sm">
                <div className="font-medium">{t.author}</div>
                <div className="text-muted-vq text-xs">{t.role} · {t.venue}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="badge-mono text-accent-vq" style={{ background: "var(--color-surface)" }}>FAQ</span>
          <h2 className="font-display text-5xl mt-4">Common questions.</h2>
        </motion.div>
        <div className="space-y-2">
          {siteData.faq.map((f, i) => (
            <div key={i} className="card-vq overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-5 flex items-center justify-between text-left">
                <span className="font-display text-xl">{f.q}</span>
                <ChevronDown size={18} className={open === i ? "rotate-180 transition" : "transition"} />
              </button>
              {open === i && <div className="px-5 pb-5 text-muted-vq leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ venue: "", address: "", email: "", service: "", message: "" });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!form.venue || !form.email) {
      toast.error("Venue name and email are required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thanks — we'll be in touch within 24 hours.");
      setForm({ venue: "", address: "", email: "", service: "", message: "" });
    }, 800);
  };
  return (
    <section id="contact" className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="badge-mono text-accent-vq" style={{ background: "var(--color-bg)" }}>Get your free report</span>
          <h2 className="font-display text-5xl md:text-6xl mt-4 leading-[1]">Tell us about your venue.</h2>
          <p className="text-muted-vq mt-5 max-w-md leading-relaxed">
            48 hours later you'll have a private URL with every review analysed and a prioritised action plan.
          </p>
          <div className="flex items-center gap-2 mt-8 text-accent-vq">
            <Mail size={16} /> <span>{siteData.brand.email}</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-vq p-7 space-y-3">
          <input className="input-vq" placeholder="Venue name *" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          <input className="input-vq" placeholder="Venue address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="input-vq" type="email" placeholder="Your email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="input-vq" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            <option value="">Service interested in…</option>
            {siteData.serviceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <textarea className="input-vq min-h-[100px]" placeholder="Anything else? (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button onClick={submit} disabled={loading} className="btn-filled w-full">
            {loading ? "Sending…" : "Request my free report"}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-accent-vq">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
        <div className="font-mono-vq font-bold tracking-wider">Venue<span className="text-accent-vq">IQ</span></div>
        <div className="flex gap-5 text-muted-vq">
          {siteData.nav.map((n) => <a key={n.href} href={n.href} className="hover:text-foreground">{n.label}</a>)}
          <Link to="/admin" className="hover:text-foreground">Admin</Link>
        </div>
        <div className="text-xs text-muted-vq">© {new Date().getFullYear()} VenueIQ. All rights reserved.</div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="bg-bg text-foreground min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <SampleReportTeaser />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
