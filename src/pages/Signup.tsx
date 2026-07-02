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
import { seedIfEmpty, Role } from "@/lib/store";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);

  useEffect(() => { seedIfEmpty(); document.title = "Create account — Ether"; }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const u = await signUp(parsed.data.name, parsed.data.email, parsed.data.password, role);
      toast.success(`Account created — welcome, ${u.name}`);
      navigate(u.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden flex flex-col">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pulse-bg pointer-events-none" />
      <nav className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between px-6 md:px-10 py-6">
        <EtherLogo />
        <ThemeToggle />
      </nav>
      <main className="relative z-10 flex-1 grid place-items-center px-6 py-10">
        <div className="w-full max-w-md obsidian-card rounded-2xl p-8 animate-fade-up">
          <h1 className="font-heading text-3xl font-light tracking-tight mb-2">Create account</h1>
          <p className="text-sm text-muted-foreground mb-8">Join the Ether network in under a minute.</p>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Maya Chen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ether.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["student", "admin"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      role === r ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-full">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already a member? <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
