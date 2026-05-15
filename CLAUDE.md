# VibeMesh — CLAUDE.md

## What This Project Is
A social platform where vibe-coded apps are uploaded as zips, discovered, downloaded, and remixed. Like MakerWorld but for apps. We do not run user apps. We do not edit code. We distribute files.

## Stack
Next.js 14 App Router · TypeScript strict · Tailwind · Supabase (auth + db + storage) · pnpm

## Project Rules

**Never build these — they are out of scope:**
- A code editor or AI chat inside the site
- Managed hosting or execution of user apps
- Per-user databases for app data

**Always:**
- Check scan_status = 'clean' AND status = 'active' before serving any app to users
- Route zip downloads through the download API endpoint — never expose raw storage URLs
- Use the service role key server-side only — never in client components
- Increment download_count before returning the signed URL, not after
- Parse and display package.json dependencies on every app page before the download button

## Common Mistakes to Avoid

**Auth:** Supabase sessions must be refreshed in middleware on every request or server components will get stale auth state.

**Storage:** Zips go in a PRIVATE bucket. Preview images go in a PUBLIC bucket. Do not mix these.

**RLS:** Apps are only publicly visible when status = 'active' AND scan_status = 'clean'. Pending and flagged apps are only visible to their creator.

**Remix count:** Increment on the parent app, not the child. Only increment when the remix reaches 'active' status, not on upload.

**Slugs:** Must be unique. Always check for collisions before insert. Append a short random suffix if the title slug already exists.

**Zip validation:** Block server-side, not just client-side. Client validation is UX only.

**Download logging:** Anonymous downloads are allowed. downloader_id is nullable. Do not block unauthenticated users from downloading.

**Scan flow:** Upload → insert as pending/queued → fire scan async → scanner webhook updates status. Never make an app active before the scan completes.

## File Structure Hint
/app/api/ for route handlers · /lib/ for utilities · /types/index.ts for all shared types · /lib/validations.ts for all Zod schemas — import from there, never redefine inline

## Design Tokens
Dark bg (#080B12) · Cards (#0D1117) · Neon green (#00FF87) primary CTA · Electric blue (#00B4FF) links · Purple (#9B5CFF) remix indicators · Fonts: Cabinet Grotesk (headings) + Geist (body) + Geist Mono (code/deps)

## Language Rules
Never say: repository, deployment, dependencies, environment
Always say: blueprint, going live, packages, setup
