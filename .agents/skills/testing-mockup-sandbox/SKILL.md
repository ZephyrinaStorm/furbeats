---
name: testing-mockup-sandbox
description: Test the mockup-sandbox component preview server end-to-end. Use when verifying mockup-sandbox UI, Vite config, or Tailwind styling changes.
---

# Testing mockup-sandbox

## Prerequisites
- Node.js v22+
- pnpm installed
- Dependencies installed: `pnpm install` from repo root

## Devin Secrets Needed
None — mockup-sandbox has no external service dependencies.

## Starting the Dev Server
```bash
cd /home/ubuntu/furbeats
pnpm --filter @workspace/mockup-sandbox run dev
```
The Vite dev server starts on `http://localhost:5173/` by default.

## What to Test

### 1. Gallery Page (root `/`)
- **Expected**: Page title "Component Preview Server" (h1), description text about rendering components for the workspace canvas, and an example path `/preview/ComponentName` in a code block
- **Styles**: Centered layout, light gray background (`bg-gray-50`), proper Tailwind typography
- **Console**: Should have zero errors/warnings

### 2. Preview Route (`/preview/<ComponentName>`)
- Components are loaded from `mockups/` directory. The `mockupPreviewPlugin` in `mockupPreviewPlugin.ts` auto-discovers `.tsx` files in `mockups/` and generates `src/.generated/mockup-components.ts` at dev/build time
- If a component exists: it renders in an isolated preview
- If a component does NOT exist: shows red error text "No component found at <name>.tsx" — no crash
- To add a test component, create a `.tsx` file in `mockups/` that exports a default React component

### 3. Build Verification
```bash
pnpm run typecheck   # Full workspace typecheck
pnpm run build       # Full workspace build (includes mockup-sandbox vite build)
```
Both should exit with code 0.

## Key Architecture Notes
- **Tailwind v4**: Uses `@theme inline` and `@import "tailwindcss"` syntax in `src/index.css` (NOT the old v3 `@layer` approach)
- **Path aliases**: `@/` maps to `./src/` (configured in both `vite.config.ts` and `tsconfig.json`)
- **shadcn/ui components**: Located in `src/components/ui/`. All import `cn()` from `@/lib/utils`
- **Auto-generated module**: `src/.generated/mockup-components.ts` is a placeholder that gets overwritten by the Vite plugin. Don't edit it manually
- **Workspace registration**: mockup-sandbox must be listed in `pnpm-workspace.yaml` for dependencies to install

## Common Issues
- If Tailwind styles aren't applying, check that `src/index.css` uses v4 syntax (`@theme inline`) not v3 (`@layer`)
- If components fail to import, verify `@/lib/utils.ts` exists with the `cn()` function
- If `pnpm install` doesn't install mockup-sandbox deps, check it's listed in `pnpm-workspace.yaml`
