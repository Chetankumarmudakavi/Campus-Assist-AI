import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Sparkles, Shield, Zap, MessageSquare } from "lucide-react";
import { EtherLogo } from "@/components/EtherLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { seedIfEmpty } from "@/lib/store";

const Landing = () => {
  useEffect(() => {
    seedIfEmpty();
    document.title = "Ether — AI Smart Campus Helpdesk";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Ether is the AI-powered campus helpdesk that resolves admissions, fees, hostel and exam queries instantly.");
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground relative overflow-hidden">
      {/* Pulse */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pulse-bg pointer-events-none animate-pulse-slow" />

      <nav className="relative z-50 max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-6">
        <EtherLogo />
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Capabilities</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="outline" size="sm" className="rounded-full border-border bg-transparent">Login</Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        <section className="pt-20 pb-32 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-xs font-medium text-muted-foreground mb-8">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="tracking-wider uppercase">AI Campus Intelligence</span>
          </div>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight text-balance mb-8">
            Campus,{" "}
            <span className="italic font-normal bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              helpdesk
            </span>
            .
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mb-10 text-pretty">
            The Ether core unifies every campus node — admissions, exams, fees, hostel — into a singular,
            responsive intelligence layer. No searching. Just summoning.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" className="rounded-full h-12 px-7 bg-foreground text-background hover:bg-foreground/90">
                Open the portal <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-border bg-transparent">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground font-mono">
            Demo accounts — student@ether.edu / student123 · admin@ether.edu / admin123
          </p>
        </section>

        <section id="features" className="grid grid-cols-12 gap-4 pb-32">
          <Feature
            className="col-span-12 md:col-span-5 h-[360px]"
            icon={<Sparkles className="size-5" />}
            title="Fluid Intelligence"
            body="Ether predicts student needs from context — current term, last query, course load — surfacing answers before you finish typing."
          />
          <Feature
            className="col-span-12 md:col-span-7 h-[360px]"
            icon={<MessageSquare className="size-5" />}
            title="Conversational Helpdesk"
            body="Chat naturally about deadlines, fees, hostel curfews, library hours. Voice input supported. History preserved across sessions."
          />
          <Feature
            className="col-span-12 md:col-span-7 h-[280px]"
            icon={<Shield className="size-5" />}
            title="Institutional Core"
            body="Admin-controlled FAQ knowledge base with full CRUD, category management, and analytics on the most-asked questions."
          />
          <Feature
            className="col-span-12 md:col-span-5 h-[280px]"
            icon={<Zap className="size-5" />}
            title="Instant Resolution"
            body="Semantic FAQ matching surfaces the closest answer in milliseconds, with intelligent fallback when nothing matches."
          />
        </section>

        <section id="how" className="pb-32">
          <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight mb-12 max-w-2xl">
            Three steps to <span className="italic">clarity</span>.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Sign in", b: "Students and faculty access the portal with a single account. Admins manage knowledge separately." },
              { n: "02", t: "Ask anything", b: "Type or speak your question. Ether matches it against the institutional FAQ in real time." },
              { n: "03", t: "Get resolved", b: "Receive precise answers with related suggestions. History saved for analytics and admin review." },
            ].map((s) => (
              <div key={s.n} className="obsidian-card rounded-2xl p-8">
                <div className="font-heading text-3xl font-light text-primary mb-6">{s.n}</div>
                <h3 className="text-lg font-medium mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.b}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <EtherLogo />
            <p className="text-xs text-muted-foreground mt-3 max-w-xs">
              Sophisticated campus operations powered by fluid intelligence.
            </p>
          </div>
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            © 2025 · v1.0
          </div>
        </div>
      </footer>
    </div>
  );
};

function Feature({ className = "", icon, title, body }: { className?: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className={`obsidian-card rounded-2xl p-8 flex flex-col justify-between ${className}`}>
      <div className="size-10 rounded-xl bg-primary/15 border border-primary/20 grid place-items-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-light font-heading mb-2 tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm max-w-md">{body}</p>
      </div>
    </div>
  );
}

export default Landing;
