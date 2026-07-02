import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { seedIfEmpty } from "@/lib/store";
import Landing from "./Landing";

const Index = () => {
  const { user } = useAuth();
  useEffect(() => { seedIfEmpty(); }, []);
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return <Landing />;
};

export default Index;
