# Hosting and access from any computer

GitHub stores the code; Supabase stores application data and Auth; a hosting provider
serves the Next.js application. Supabase alone does not replace application hosting.

## Recommended initial arrangement

- Private GitHub repository as code source of truth.
- Vercel or another Next.js-compatible provider for preview and production builds.
- Separate Supabase development and production projects.
- Preview deployments use development/test data only.
- Production deployment requires explicit approval after Auth, RLS, backups and audit
  behavior are verified.

## Deployment checklist

- Connect only the confirmed private repository.
- Set Node/pnpm versions from `package.json` and the lockfile.
- Build command: `pnpm build`.
- Never commit `.env.local`; enter environment variables in the host's secret manager.
- Separate preview and production variables.
- Restrict the first preview URL or use test accounts while access control is mocked.
- Configure a custom domain only after the product owner confirms it.
- Enable deployment logs without recording tokens, CV contents or offer content.

## Current warning

The included frontend has a development-only role switcher. Do not present the current
preview as a secure production portal. Replace it with real Auth plus server-side role
checks and RLS before handling any real HR data.
