// Mock data store using localStorage. Frontend-only prototype.
export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock — DO NOT use this pattern in production
  role: Role;
}

export interface Category {
  id: string;
  name: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
}

export interface Query {
  id: string;
  userId: string;
  question: string;
  response: string;
  matchedFaqId?: string;
  timestamp: number;
}

const KEYS = {
  users: "ether.users",
  session: "ether.session",
  categories: "ether.categories",
  faqs: "ether.faqs",
  queries: "ether.queries",
  theme: "ether.theme",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const uid = () => Math.random().toString(36).slice(2, 10);

// ---- Seed ----
export function seedIfEmpty() {
  if (!localStorage.getItem(KEYS.users)) {
    const admin: User = { id: uid(), name: "Campus Admin", email: "admin@ether.edu", password: "admin123", role: "admin" };
    const student: User = { id: uid(), name: "Demo Student", email: "student@ether.edu", password: "student123", role: "student" };
    write(KEYS.users, [admin, student]);
  }
  if (!localStorage.getItem(KEYS.categories)) {
    const cats: Category[] = [
      { id: "c-adm", name: "Admissions" },
      { id: "c-exam", name: "Exams" },
      { id: "c-fee", name: "Fees" },
      { id: "c-host", name: "Hostel" },
      { id: "c-lib", name: "Library" },
    ];
    write(KEYS.categories, cats);
  }
  if (!localStorage.getItem(KEYS.faqs)) {
    const faqs: FAQ[] = [
      { id: uid(), question: "What is the admission deadline for fall intake?", answer: "Fall admission applications close on August 15. Submit transcripts and recommendation letters via the admissions portal.", categoryId: "c-adm" },
      { id: uid(), question: "How do I apply for a scholarship?", answer: "Log in to the portal, go to Financial Aid → Scholarships, complete the merit/need form before May 30.", categoryId: "c-adm" },
      { id: uid(), question: "When are mid-semester exams scheduled?", answer: "Mid-semester exams run in week 8. Check the academic calendar in your dashboard for exact dates per course.", categoryId: "c-exam" },
      { id: uid(), question: "How can I request a re-evaluation of my grade?", answer: "Submit a re-evaluation request within 14 days of result publication via Academics → Grade Appeal.", categoryId: "c-exam" },
      { id: uid(), question: "What are the tuition fee payment options?", answer: "We accept bank transfer, credit/debit cards, and installment plans (3 or 6 months). Late fees apply after the 10th.", categoryId: "c-fee" },
      { id: uid(), question: "How do I get a fee receipt?", answer: "Receipts are auto-generated under Finance → Payments and emailed within 24 hours of payment.", categoryId: "c-fee" },
      { id: uid(), question: "How do I book a hostel room?", answer: "Hostel allocation opens July 1. Apply via Housing → Apply, choose preferences, and pay the booking deposit.", categoryId: "c-host" },
      { id: uid(), question: "What are hostel curfew timings?", answer: "Hostel gates close at 11:00 PM on weekdays and 12:30 AM on weekends. Late entries require a warden pass.", categoryId: "c-host" },
      { id: uid(), question: "What are the library opening hours?", answer: "Mon–Fri 8 AM to 11 PM, Sat–Sun 10 AM to 8 PM. Extended 24/7 access during finals week.", categoryId: "c-lib" },
      { id: uid(), question: "How many books can I borrow at once?", answer: "Undergraduates: 5 books for 14 days. Graduates: 10 books for 21 days. Renewals via the library portal.", categoryId: "c-lib" },
    ];
    write(KEYS.faqs, faqs);
  }
  if (!localStorage.getItem(KEYS.queries)) write(KEYS.queries, []);
}

// ---- Users / Auth ----
export const getUsers = () => read<User[]>(KEYS.users, []);
export const setUsers = (u: User[]) => write(KEYS.users, u);

export function signUp(name: string, email: string, password: string, role: Role = "student"): User {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user: User = { id: uid(), name, email, password, role };
  users.push(user);
  setUsers(users);
  setSession(user.id);
  return user;
}

export function signIn(email: string, password: string): User {
  const user = getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error("Invalid email or password.");
  setSession(user.id);
  return user;
}

export function signOut() {
  localStorage.removeItem(KEYS.session);
}

export function setSession(userId: string) {
  write(KEYS.session, { userId, ts: Date.now() });
}

export function currentUser(): User | null {
  const s = read<{ userId: string } | null>(KEYS.session, null);
  if (!s) return null;
  return getUsers().find((u) => u.id === s.userId) ?? null;
}

// ---- Categories ----
export const getCategories = () => read<Category[]>(KEYS.categories, []);
export const setCategories = (c: Category[]) => write(KEYS.categories, c);
export function addCategory(name: string): Category {
  const cats = getCategories();
  const cat: Category = { id: "c-" + uid(), name: name.trim() };
  cats.push(cat);
  setCategories(cats);
  return cat;
}
export function updateCategory(id: string, name: string) {
  const cats = getCategories().map((c) => (c.id === id ? { ...c, name: name.trim() } : c));
  setCategories(cats);
}
export function deleteCategory(id: string) {
  setCategories(getCategories().filter((c) => c.id !== id));
  setFAQs(getFAQs().filter((f) => f.categoryId !== id));
}

// ---- FAQs ----
export const getFAQs = () => read<FAQ[]>(KEYS.faqs, []);
export const setFAQs = (f: FAQ[]) => write(KEYS.faqs, f);
export function addFAQ(faq: Omit<FAQ, "id">): FAQ {
  const next: FAQ = { ...faq, id: uid() };
  setFAQs([...getFAQs(), next]);
  return next;
}
export function updateFAQ(id: string, patch: Partial<Omit<FAQ, "id">>) {
  setFAQs(getFAQs().map((f) => (f.id === id ? { ...f, ...patch } : f)));
}
export function deleteFAQ(id: string) {
  setFAQs(getFAQs().filter((f) => f.id !== id));
}

// ---- Queries (history + analytics) ----
export const getQueries = () => read<Query[]>(KEYS.queries, []);
export function logQuery(q: Omit<Query, "id" | "timestamp">) {
  const next: Query = { ...q, id: uid(), timestamp: Date.now() };
  write(KEYS.queries, [next, ...getQueries()].slice(0, 500));
  return next;
}

// ---- Smart matching (mock semantic search via token overlap) ----
const STOPWORDS = new Set([
  "the","a","an","is","are","of","to","for","in","on","at","by","and","or","my","i","do","how","what","when","where","can","with","be","it","this","that","you","your","please",
]);

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !STOPWORDS.has(w) && w.length > 1);
}

export interface MatchResult {
  faq: FAQ;
  score: number;
}

export function matchFAQs(question: string, topK = 3): MatchResult[] {
  const qTokens = new Set(tokenize(question));
  if (qTokens.size === 0) return [];
  const scored = getFAQs().map((faq) => {
    const fTokens = new Set([...tokenize(faq.question), ...tokenize(faq.answer)]);
    let overlap = 0;
    qTokens.forEach((t) => { if (fTokens.has(t)) overlap += 1; });
    // Jaccard-ish + boost when question token matches the FAQ question directly
    const qFaqTokens = new Set(tokenize(faq.question));
    let qOverlap = 0;
    qTokens.forEach((t) => { if (qFaqTokens.has(t)) qOverlap += 1; });
    const score = overlap / qTokens.size + qOverlap * 0.5;
    return { faq, score };
  });
  return scored.filter((s) => s.score > 0.2).sort((a, b) => b.score - a.score).slice(0, topK);
}

export function generateAIResponse(question: string): string {
  // Mock fallback. In a real app this would call an AI gateway.
  const q = question.trim().replace(/\?+$/, "");
  return `I couldn't find an exact match in our FAQ database for "${q}". Based on similar campus inquiries, I'd recommend contacting the relevant department directly through the portal, or rephrasing your question with more specific keywords (e.g., dates, course codes, or department names). An admin will be notified to consider adding this to the FAQ.`;
}

// ---- Theme ----
export function getTheme(): "dark" | "light" {
  return (localStorage.getItem(KEYS.theme) as "dark" | "light") || "dark";
}
export function setTheme(t: "dark" | "light") {
  localStorage.setItem(KEYS.theme, t);
  if (t === "light") document.documentElement.classList.add("light");
  else document.documentElement.classList.remove("light");
}
