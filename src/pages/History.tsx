import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { getCategories, getFAQs, getQueries, Query } from "@/lib/store";
import { Trash2 } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Helpdesk" },
  { to: "/dashboard/history", label: "History" },
  { to: "/dashboard/faqs", label: "Browse FAQs" },
];

const History = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const cats = useMemo(() => getCategories(), []);
  const faqs = useMemo(() => getFAQs(), []);

  useEffect(() => {
    document.title = "Query History — Ether";
    if (user) setQueries(getQueries().filter((q) => q.userId === user.id));
  }, [user]);

  return (
    <AppShell nav={navItems}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light tracking-tight mb-1">Your query history</h1>
        <p className="text-sm text-muted-foreground">All conversations are stored locally for your reference.</p>
      </div>

      {queries.length === 0 ? (
        <div className="obsidian-card rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">No queries yet. Head to the helpdesk to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queries.map((q) => {
            const matched = q.matchedFaqId ? faqs.find((f) => f.id === q.matchedFaqId) : null;
            const cat = matched ? cats.find((c) => c.id === matched.categoryId) : null;
            return (
              <div key={q.id} className="obsidian-card rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className={`text-[10px] uppercase tracking-widest font-medium ${matched ? "text-emerald-400" : "text-amber-400"}`}>
                    {matched ? `FAQ · ${cat?.name || "—"}` : "AI Suggestion"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(q.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium mb-2">{q.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{q.response}</p>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default History;
