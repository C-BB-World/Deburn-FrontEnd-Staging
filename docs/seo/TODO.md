# SEO/GEO — Remaining Work

Tracks status against the SEO & GEO audit for human-firstai.com (source: `humanfirstaiseogeospec.md`, not checked into this repo). Section numbers below (`§2`, `§7`, etc.) refer to that spec.

## Done

- **§2 Rendering (P0 fix):** all public marketing routes are now prerendered at build time (`scripts/prerender.js`, Playwright-driven) and served as real static HTML by `server.js` — no more identical shell/title/description across routes.
- **§2.4/§2.5:** self-referencing canonicals, per-route `<title>`/`<meta description>`, `<Seo>` component contract, build-time uniqueness guard (`scripts/check-seo-uniqueness.js`) that fails the build on any duplicate title/description/canonical.
- **§3.3:** real 404 page (`src/pages/NotFound.jsx`) replacing the old silent fallback to the login screen.
- **§3.1/§3.2:** `/login` and `/register` are `noindex, follow`, still `Allow`ed in `robots.txt`, excluded from `sitemap.xml`.
- **§4:** titles/descriptions corrected on all 6 existing pages per spec tables.
- **§4.5:** Terms of Service naming standardized ("Terms of Service" — H1 now matches the URL).
- **§6.4 item 1:** removed the `$0` `SoftwareApplication` offer; added `alternateName` ("Eve by Human First AI") for brand disambiguation (§8).
- **§6.5:** real `llms.txt`, generated from the route manifest.
- **§7:** Swedish `/sv/` routes for home, register, and login — path-based i18n, `<html lang>`, reciprocal `hreflang` + `x-default`, sitemap `xhtml:link` alternates, language toggles that navigate rather than silently switch state.
- Route manifest (`src/seo/routes.js`) is the single source of truth driving routing, prerendering, `robots.txt`, `sitemap.xml`, and `llms.txt` — nothing hand-duplicated.

## Explicitly decided against (not gaps — deliberate calls made this round)

- **§6.3 statistics:** left unsourced on the homepage, per instruction, rather than removed or fabricated a citation.
- **§6.6 testimonials:** left anonymized ("Pilot participant, leadership program"), not marked up as `Review`/`AggregateRating` schema.
- **§6.4 item 2 `sameAs`:** not added — no real LinkedIn/social URL exists yet to point to. Add it the moment one exists.

## Outstanding

### Blocked on you / external input

- **§5.1 `/about` page.** Deferred — needs founder sign-off on content (named team, credentials, positioning) before it's built. Route manifest is structured so it's a small addition once approved.
- **§3.4 Staging lockdown.** `hfai-staging.onrender.com` is indexed by Google. Needs, on the Render side (not this repo): a `Disallow: /` robots.txt on the staging host itself, HTTP Basic Auth or IP allowlist, and a Search Console URL removal request once locked down. Also worth checking for other `*.onrender.com` previews across the BrainBank portfolio.
- **Swedish legal pages.** `/privacy-policy`, `/terms-of-service`, `/cookie-policy` have zero translation infrastructure today (no `useTranslation` calls, no `legal` namespace in `src/locales/sv/`). Translating ~1300+ words of GDPR/PDPA legal text needs a real translator/legal review, not an LLM draft — held back deliberately this round.
- **Native-speaker check on new Swedish SEO copy.** The `/sv/`, `/sv/register`, `/sv/login` titles/descriptions were drafted from your own already-shipped `sv/landing.json` / `sv/auth.json` vocabulary, but haven't had a native-speaker skim.

### Production-only verification (can't be checked from local dev)

- **§2.4:** confirm `human-firstai.com` → `www.human-firstai.com` is a real 301 (`curl -sI https://human-firstai.com/`).
- **§10 manual checks:** Google Rich Results Test and schema.org validator on `/` (and `/about` once it ships); verify Search Console before/after Phase 1's ship date so there's a real baseline; confirm the indexed staging URL drops out of search results after §3.4 lands (allow a few weeks); submit updated `sitemap.xml` in Search Console.

### Low priority / optional

- **§6.4 item 5 `BreadcrumbList`.** Spec calls this "trivial but low priority" given how few pages exist (6–9 routes, flat structure). Not done; add only if there's a reason to.
- **§6.4 item 3 `Person` schema.** Blocked on `/about` naming real people — do it alongside that page.

## Notes for whoever picks this up

- Everything route/metadata-related flows from `src/seo/routes.js` (`pages` + `buildRoutes()` + `alternatesFor()` + `copyFor()`). Add a page there first; routing, sitemap, robots, and prerendering follow automatically.
- `npm run build` runs the full pipeline: `vite build` → `prerender` → `gen:seo` → `check:seo`. The last step fails the build on any SEO regression — don't skip it in CI.
- The backend API (`VITE_API_URL`) must be reachable at build time — the homepage's testimonials are fetched live and baked into the prerendered output.
