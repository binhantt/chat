import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
  /** "hidden" for chat page so it fills exact height without double scrollbar */
  contentOverflow?: "auto" | "hidden";
  contentBg?: string;
}

export function AppLayout({ children, contentOverflow = "auto", contentBg = "#f8fafc" }: AppLayoutProps) {
  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: contentBg }}>
      <AppSidebar />
      <main style={{ flex: 1, overflow: contentOverflow, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
