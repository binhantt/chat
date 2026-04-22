## Refactoring React_Chat to TypeScript

This commit refactors the `React_Chat` project to exclusively use TypeScript, ensuring type safety and consistency across the codebase. Unnecessary JavaScript files have been removed, and existing ones have been converted to their TypeScript equivalents.

**Key Changes:**

- **Deleted Redundant JSX Files:**
  - `React_Chat/src/App.jsx` (duplicate of `App.tsx`)
  - `React_Chat/src/main.jsx` (duplicate of `main.tsx`)

- **Renamed JavaScript/JSX Files to TypeScript/TSX:**
  - `React_Chat/src/shared/api/axiosClient.js` -> `React_Chat/src/shared/api/axiosClient.ts`
  - `React_Chat/src/features/auth/types/auth.type.js` -> `React_Chat/src/features/auth/types/auth.type.ts`
  - `React_Chat/src/features/auth/store/auth.store.js` -> `React_Chat/src/features/auth/store/auth.store.ts`
  - `React_Chat/src/features/auth/components/LoginForm.jsx` -> `React_Chat/src/features/auth/components/LoginForm.tsx`
  - `React_Chat/src/features/auth/pages/LoginPage.jsx` -> `React_Chat/src/features/auth/pages/LoginPage.tsx`

- **Content Verification:**
  - Reviewed the content of the renamed files (`.ts` and `.tsx`) and confirmed they were already largely written with TypeScript syntax, or required no further explicit type conversions for basic functionality.
  - Verified that import statements did not explicitly refer to `.js` or `.jsx` extensions, meaning no import path updates were necessary after file renaming.

- **Configuration Files:**
  - The `eslint.config.js` file was retained as it functions correctly as a JavaScript configuration file within a TypeScript project.
  - The `package.json` was reviewed and confirmed to have appropriate scripts for building and linting a TypeScript project.

These changes ensure the `React_Chat` project now fully leverages the benefits of TypeScript.