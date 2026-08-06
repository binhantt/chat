"use client";

import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// Layout
import layoutStyles from "../components/layout/admin-layout.module.css";
import sidebarStyles from "../components/layout/admin-sidebar.module.css";
import navbarStyles from "../components/layout/admin-navbar.module.css";
import mobileNavStyles from "../components/layout/admin-mobile-nav.module.css";

// Dashboard
import dashboardStyles from "../components/dashboard/admin-dashboard.module.css";

// Users
import usersStyles from "../components/users/admin-users.module.css";

// Chat
import chatStyles from "../components/chat/admin-chat.module.css";

// Reports
import reportsStyles from "../components/reports/admin-reports.module.css";

// Conduct
import conductStyles from "../components/conduct/admin-conduct.module.css";

// Login
import authShellStyles from "../login/components/admin-auth-shell.module.css";
import authPanelStyles from "../login/components/admin-auth-panel.module.css";
import loginCopyStyles from "../login/components/admin-login-copy.module.css";
import loginFormStyles from "../login/components/admin-login-form.module.css";
import loginFooterStyles from "../login/components/admin-login-footer.module.css";

// Settings / Ad / Payment / VIP
import settingsStyles from "../components/settings/admin-settings.module.css";
import adStyles from "../components/ad/admin-ad.module.css";
import paymentStyles from "../components/payment/admin-payment.module.css";
import vipStyles from "../components/vip/admin-vip.module.css";

/**
 * Centralized hook for all admin CSS Module class maps.
 *
 * - Returns stable references via useMemo, keyed on theme.
 * - Re-renders consuming components when theme changes (via useTheme).
 * - Single import point for all admin styles — swap modules here to
 *   support theme-specific or dynamic CSS at scale.
 *
 * Usage (client components only):
 *   const s = useAdminStyles();
 *   <div className={s.dashboard.panel}>...</div>
 */
export function useAdminStyles() {
  const { theme } = useTheme();

  return useMemo(
    () => ({
      theme,

      // Layout
      layout: layoutStyles,
      sidebar: sidebarStyles,
      navbar: navbarStyles,
      mobileNav: mobileNavStyles,

      // Pages
      dashboard: dashboardStyles,
      users: usersStyles,
      chat: chatStyles,
      reports: reportsStyles,
      conduct: conductStyles,
      settings: settingsStyles,
      ad: adStyles,
      payment: paymentStyles,
      vip: vipStyles,

      // Login
      authShell: authShellStyles,
      authPanel: authPanelStyles,
      loginCopy: loginCopyStyles,
      loginForm: loginFormStyles,
      loginFooter: loginFooterStyles,
    }),
    [theme],
  );
}
