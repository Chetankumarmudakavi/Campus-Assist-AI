import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Category, FAQ, getCategories, getFAQs } from "@/lib/store";
import { Search } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Helpdesk" },
  { to: "/dashboard/history", label: "History" },
  { to: "/dashboard/faqs", label: "Browse FAQs" },
];

const BrowseFaqs = () => {
  const [categories] = useState<Category[]>(() => getCategories());
  const [faqs] = useState<FAQ[]>(() => getFAQs());
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  useEffect(() => { document.title = "FAQs — Ether"; }, []);

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = activeCat === "all" || f.categoryId === activeCat;
      const q = query.trim().toLowerCase();
      const matchQ = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [faqs, query, activeCat]);

  return (
    <AppShell nav={navItems}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light tracking-tight mb-1">Knowledge base</h1>
        <p className="text-sm text-muted-foreground">Browse the institutional FAQ archive.</p>
      </div>

      <div className="obsidian-card rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs…"
            className="flex-1 bg-transparent outline-none text-sm py-2.5"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCat("all")}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${activeCat === "all" ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${activeCat === c.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((f) => {
          const cat = categories.find((c) => c.id === f.categoryId);
          return (
            <div key={f.id} className="obsidian-card rounded-xl p-5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{cat?.name}</span>
              <h3 className="text-sm font-medium mt-1 mb-2">{f.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-10">No FAQs match your search.</p>
        )}
      </div>
    </AppShell>
  );
};

export default BrowseFaqs;
