import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { EtherLogo } from "@/components/EtherLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { seedIfEmpty } from "@/lib/store";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    document.title = "Sign in — Ether";
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const u = await signIn(parsed.data.email, parsed.data.password);
      toast.success(`Student Login Portal, ${u.name}`);
      navigate(u.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden flex flex-col">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pulse-bg pointer-events-none" />
      <nav className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between px-6 md:px-10 py-6">
        <EtherLogo />
        <ThemeToggle />
      </nav>
      <main className="relative z-10 flex-1 grid place-items-center px-6 py-10">
        <div className="w-full max-w-md obsidian-card rounded-2xl p-8 animate-fade-up">
          <h1 className="font-heading text-3xl font-light tracking-tight mb-2">Student Login Portal</h1>
          <p className="text-sm text-muted-foreground mb-8">Sign in to access the campus intelligence layer.</p>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ether.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fill("student@ether.edu", "student123")} className="text-left p-3 rounded-lg border border-border hover:bg-secondary text-xs">
                <div className="font-medium">Student</div>
                <div className="text-muted-foreground truncate">student@ether.edu</div>
              </button>
              <button onClick={() => fill("admin@ether.edu", "admin123")} className="text-left p-3 rounded-lg border border-border hover:bg-secondary text-xs">
                <div className="font-medium">Admin</div>
                <div className="text-muted-foreground truncate">admin@ether.edu</div>
              </button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New here? <Link to="/signup" className="text-foreground underline underline-offset-4">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
