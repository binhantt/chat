"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageVisitTracker } from "./PageVisitTracker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PageVisitTracker />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
