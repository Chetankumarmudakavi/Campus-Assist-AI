import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme } from "@/lib/store";

export function ThemeToggle() {
  const [theme, setT] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const t = getTheme();
    setT(t);
    setTheme(t);
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setT(next);
    setTheme(next);
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="size-9 grid place-items-center rounded-full border border-border hover:bg-secondary transition-colors"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
