import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  addFAQ, deleteFAQ, FAQ, getCategories, getFAQs, updateFAQ,
} from "@/lib/store";
import { toast } from "sonner";
import { z } from "zod";

const navItems = [
  { to: "/admin", label: "FAQs" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/analytics", label: "Analytics" },
];

const faqSchema = z.object({
  question: z.string().trim().min(8, "Question is too short").max(300),
  answer: z.string().trim().min(8, "Answer is too short").max(2000),
  categoryId: z.string().min(1, "Pick a category"),
});

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>(() => getFAQs());
  const categories = useMemo(() => getCategories(), []);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  // form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || "");

  useEffect(() => { document.title = "FAQ Management — Ether Admin"; }, []);

  const refresh = () => setFaqs(getFAQs());

  const openNew = () => {
    setEditing(null);
    setQuestion(""); setAnswer(""); setCategoryId(categories[0]?.id || "");
    setOpen(true);
  };
  const openEdit = (f: FAQ) => {
    setEditing(f); setQuestion(f.question); setAnswer(f.answer); setCategoryId(f.categoryId);
    setOpen(true);
  };

  const submit = () => {
    const parsed = faqSchema.safeParse({ question, answer, categoryId });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const data = { question: parsed.data.question, answer: parsed.data.answer, categoryId: parsed.data.categoryId };
    if (editing) {
      updateFAQ(editing.id, data);
      toast.success("FAQ updated");
    } else {
      addFAQ(data);
      toast.success("FAQ added");
    }
    refresh(); setOpen(false);
  };

  const remove = (f: FAQ) => {
    deleteFAQ(f.id);
    refresh();
    toast.success("FAQ deleted");
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return faqs.filter((f) => !t || f.question.toLowerCase().includes(t) || f.answer.toLowerCase().includes(t));
  }, [faqs, q]);

  return (
    <AppShell nav={navItems}>
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-light tracking-tight mb-1">FAQ management</h1>
          <p className="text-sm text-muted-foreground">{faqs.length} entries · {categories.length} categories</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="rounded-full bg-foreground text-background hover:bg-foreground/90 gap-2">
              <Plus className="size-4" /> New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cat">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="cat"><SelectValue placeholder="Pick a category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q">Question</Label>
                <Input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={300} placeholder="What is…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a">Answer</Label>
                <Textarea id="a" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={2000} placeholder="Provide a clear, concise answer." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} className="bg-foreground text-background hover:bg-foreground/90">
                {editing ? "Save changes" : "Create FAQ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="obsidian-card rounded-2xl p-4 mb-4 flex items-center gap-2">
        <Search className="size-4 text-muted-foreground ml-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search FAQs…"
          className="flex-1 bg-transparent outline-none text-sm py-2"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((f) => {
          const cat = categories.find((c) => c.id === f.categoryId);
          return (
            <div key={f.id} className="obsidian-card rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{cat?.name || "—"}</span>
                <h3 className="text-sm font-medium mt-1 mb-1">{f.question}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{f.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(f)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Delete"><Trash2 className="size-4 text-destructive" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(f)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="obsidian-card rounded-xl p-10 text-center text-sm text-muted-foreground">No FAQs found.</div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminFaqs;
