import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { addCategory, Category, deleteCategory, getCategories, getFAQs, updateCategory } from "@/lib/store";
import { toast } from "sonner";

const navItems = [
  { to: "/admin", label: "FAQs" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/analytics", label: "Analytics" },
];

const AdminCategories = () => {
  const [cats, setCats] = useState<Category[]>(() => getCategories());
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => { document.title = "Categories — Ether Admin"; }, []);

  const refresh = () => setCats(getCategories());
  const faqCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of getFAQs()) map[f.categoryId] = (map[f.categoryId] || 0) + 1;
    return map;
  }, [cats]);

  const create = () => {
    const v = name.trim();
    if (v.length < 2 || v.length > 40) { toast.error("Name must be 2–40 characters."); return; }
    if (cats.some((c) => c.name.toLowerCase() === v.toLowerCase())) { toast.error("Category already exists."); return; }
    addCategory(v); setName(""); refresh(); toast.success("Category added");
  };

  const startEdit = (c: Category) => { setEditingId(c.id); setEditingName(c.name); };
  const saveEdit = () => {
    const v = editingName.trim();
    if (v.length < 2) { toast.error("Name too short"); return; }
    if (editingId) updateCategory(editingId, v);
    setEditingId(null); refresh(); toast.success("Category updated");
  };
  const remove = (id: string) => { deleteCategory(id); refresh(); toast.success("Category deleted"); };

  return (
    <AppShell nav={navItems}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light tracking-tight mb-1">Categories</h1>
        <p className="text-sm text-muted-foreground">Organize FAQs into themes for faster discovery.</p>
      </div>

      <div className="obsidian-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">New category name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Scholarships" maxLength={40} />
        </div>
        <Button onClick={create} className="bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-full">
          <Plus className="size-4" /> Add category
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {cats.map((c) => (
          <div key={c.id} className="obsidian-card rounded-xl p-5 flex items-center gap-3">
            {editingId === c.id ? (
              <>
                <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1" />
                <Button size="icon" variant="ghost" onClick={saveEdit}><Check className="size-4 text-emerald-400" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="size-4" /></Button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{faqCounts[c.id] || 0} FAQs</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="size-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{c.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will also remove {faqCounts[c.id] || 0} FAQs in this category.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(c.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminCategories;
