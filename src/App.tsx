import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { seedIfEmpty, getTheme, setTheme } from "@/lib/store";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import History from "./pages/History.tsx";
import BrowseFaqs from "./pages/BrowseFaqs.tsx";
import AdminFaqs from "./pages/AdminFaqs.tsx";
import AdminCategories from "./pages/AdminCategories.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    seedIfEmpty();
    setTheme(getTheme());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/history" element={<ProtectedRoute role="student"><History /></ProtectedRoute>} />
              <Route path="/dashboard/faqs" element={<ProtectedRoute role="student"><BrowseFaqs /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminFaqs /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute role="admin"><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
