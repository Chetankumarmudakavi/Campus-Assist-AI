import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { currentUser, signIn as signInStore, signOut as signOutStore, signUp as signUpStore, User, Role } from "@/lib/store";

interface AuthCtx {
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string, role?: Role) => Promise<User>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(currentUser());
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = signInStore(email, password);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, role: Role = "student") => {
    const u = signUpStore(name, email, password, role);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    signOutStore();
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
