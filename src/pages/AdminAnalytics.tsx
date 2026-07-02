import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { getCategories, getFAQs, getQueries } from "@/lib/store";
import { TrendingUp, MessageSquare, AlertCircle, Database } from "lucide-react";

const navItems = [
  { to: "/admin", label: "FAQs" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/analytics", label: "Analytics" },
];

const AdminAnalytics = () => {
  useEffect(() => { document.title = "Analytics — Ether Admin"; }, []);

  const data = useMemo(() => {
    const queries = getQueries();
    const faqs = getFAQs();
    const cats = getCategories();
    const matched = queries.filter((q) => q.matchedFaqId);
    const unmatched = queries.filter((q) => !q.matchedFaqId);

    // top FAQs
    const faqHits: Record<string, number> = {};
    for (const q of matched) if (q.matchedFaqId) faqHits[q.matchedFaqId] = (faqHits[q.matchedFaqId] || 0) + 1;
    const topFaqs = Object.entries(faqHits)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, n]) => ({ faq: faqs.find((f) => f.id === id), count: n }))
      .filter((x) => x.faq);
    const maxFaq = topFaqs[0]?.count || 1;

    // category distribution
    const catHits: Record<string, number> = {};
    for (const q of matched) {
      const f = q.matchedFaqId ? faqs.find((x) => x.id === q.matchedFaqId) : null;
      if (f) catHits[f.categoryId] = (catHits[f.categoryId] || 0) + 1;
    }
    const catRows = cats.map((c) => ({ cat: c, count: catHits[c.id] || 0 })).sort((a, b) => b.count - a.count);
    const maxCat = Math.max(1, ...catRows.map((r) => r.count));

    return { queries, faqs, cats, matched, unmatched, topFaqs, maxFaq, catRows, maxCat };
  }, []);

  const stats = [
    { label: "Total queries", value: data.queries.length, icon: MessageSquare },
    { label: "FAQ matches", value: data.matched.length, icon: TrendingUp },
    { label: "Unmatched (AI)", value: data.unmatched.length, icon: AlertCircle },
    { label: "Knowledge base", value: data.faqs.length, icon: Database },
  ];

  return (
    <AppShell nav={navItems}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light tracking-tight mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights into how students use the helpdesk.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="obsidian-card rounded-2xl p-5">
            <s.icon className="size-4 text-primary mb-3" />
            <div className="font-heading text-3xl font-light">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="obsidian-card rounded-2xl p-6">
          <h2 className="text-sm font-medium mb-4">Top FAQs</h2>
          {data.topFaqs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet — once students start asking, top hits appear here.</p>
          ) : (
            <ul className="space-y-3">
              {data.topFaqs.map(({ faq, count }) => (
                <li key={faq!.id}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-xs line-clamp-1">{faq!.question}</span>
                    <span className="text-xs font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(count / data.maxFaq) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="obsidian-card rounded-2xl p-6">
          <h2 className="text-sm font-medium mb-4">Category distribution</h2>
          {data.matched.length === 0 ? (
            <p className="text-xs text-muted-foreground">No category data yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.catRows.map(({ cat, count }) => (
                <li key={cat.id}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-xs">{cat.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary-glow" style={{ width: `${(count / data.maxCat) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="obsidian-card rounded-2xl p-6 mt-4">
        <h2 className="text-sm font-medium mb-4">Recent unmatched queries</h2>
        {data.unmatched.length === 0 ? (
          <p className="text-xs text-muted-foreground">No unmatched queries — your knowledge base is doing great.</p>
        ) : (
          <ul className="space-y-2">
            {data.unmatched.slice(0, 8).map((q) => (
              <li key={q.id} className="text-xs flex items-baseline justify-between gap-3 border-b border-border pb-2 last:border-0">
                <span className="line-clamp-1">{q.question}</span>
                <span className="font-mono text-muted-foreground shrink-0">{new Date(q.timestamp).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

export default AdminAnalytics;
