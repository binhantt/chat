# DOC 05 - UI Color Palette

Updated: 30/05/2026

This document records the color palette currently used for the `Frontend` UI. The goal is to keep login, user, chat, and admin consistent in color tone, avoiding different styles per page.

## Base Colors

| Name | Value | Used For |
| --- | --- | --- |
| Light Background | `#F4F9FF` | Main light mode background |
| Primary Blue | `#3B82F6` | Buttons, active icons, emphasis borders |
| Main Text | `#0F172A` | Headings and content in light mode |
| Secondary Text | `#475569` | Descriptions, subtitles, secondary labels |
| Cyan | `#22D3EE` | Secondary accent, subtle gradient |
| Gold | `#F59E0B` | VIP, warnings, small accents |
| Red | `#DC2626` | Errors, account lock, dangerous actions |
| Green | `#16A34A` | Success, active status |

## Light Mode

```css
:root {
  --bg: #F4F9FF;
  --primary: #3B82F6;
  --text: #0F172A;

  --auth-bg: #F4F9FF;
  --auth-border: #3B82F6;
  --auth-control: #3B82F6;
  --auth-text: #0F172A;
  --auth-muted: #475569;
  --auth-panel: rgba(255, 255, 255, 0.94);
  --auth-panel-soft: rgba(255, 255, 255, 0.72);
  --auth-panel-lift: rgba(239, 246, 255, 0.92);
  --auth-line: rgba(59, 130, 246, 0.18);
  --auth-cyan: #22D3EE;
  --auth-gold: #F59E0B;
}
```

## Dark Mode

```css
[data-theme="dark"] {
  --bg: #0B1120;
  --primary: #60A5FA;
  --text: #E2E8F0;

  --auth-bg: #0B1120;
  --auth-border: #1D4ED8;
  --auth-control: #3B82F6;
  --auth-text: #E2E8F0;
  --auth-muted: #94A3B8;
  --auth-panel: rgba(15, 23, 42, 0.94);
  --auth-panel-soft: rgba(30, 41, 59, 0.74);
  --auth-panel-lift: rgba(17, 24, 39, 0.96);
  --auth-line: rgba(96, 165, 250, 0.24);
  --auth-cyan: #22D3EE;
  --auth-gold: #FBBF24;
}
```

## Color Usage Rules

- Page background: use `--auth-bg` or `--bg`.
- Panel/card: use `--auth-panel`, don't use browser's default gray background.
- Light inner panel: use `--auth-panel-soft` or `--auth-panel-lift`.
- Primary button: use `--auth-control`.
- Border: use `--auth-line`; only use border inside components, avoid overly thick outer borders.
- Main text: use `--auth-text`.
- Secondary text: use `--auth-muted`.
- VIP page: may use `--auth-gold` as accent.
- Warning/report/lock page: use red `#DC2626` or Radix `red`.
- Success/active page: use green `#16A34A` or Radix `green`.

## Files Managing Colors

- `Frontend/app/globals.css`: declares light/dark CSS variables.
- `Frontend/features/athu/styles/authTheme.ts`: maps color variables for shared component use.
- `Frontend/features/admin/styles/*Theme.ts`: separate admin panel styles.
- `Frontend/features/chat/styles/*`: chat frame specific styles.

## UI Modification Notes

- Don't create new color palettes per component if colors already exist in `authTheme`.
- Don't use excessive gradients. If emphasis is needed, use a subtle gradient from `--auth-control` to `--auth-cyan`.
- Keep border radius around `8px` to sync with Radix UI.
- When adding dark mode, must add corresponding variables in `[data-theme="dark"]`.
- When adding new colors, update both this file and `globals.css` simultaneously.
