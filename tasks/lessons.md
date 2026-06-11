## Lessons Learned

### 2026-06-11 — Shivaay Logistics Review

1. **Always verify variable names in JS** — `name` vs `nameVal` bug in mailto subject line (`main.js:276`). Test form submission paths even if they seem trivial.

2. **Keep design spec in sync with implementation** — spec called for light-mode navy/orange palette but implementation used dark-mode midnight/amber/teal. Spec drift causes confusion for future edits.

3. **Pin CDN dependency versions** — `@latest` can break on semver-major releases. Always pin to a specific version (e.g., `lucide@0.468.0`).

4. **Don't ship unused dependencies** — Tailwind Play CDN was loaded on every page but no Tailwind utility classes were used. All styling was custom CSS. Removed it.

5. **Accessibility state must update in JS** — `aria-expanded` on nav toggle was hardcoded to `false` and never updated when menu opened/closed. Keep ARIA attributes in sync with visual state.

6. **Be consistent with `aria-current`** — `contact.html` had `aria-current="page"` on nav link but `index.html` and `services.html` didn't. Apply uniformly.

7. **Content consistency matters** — hero claimed "5+ Years Experience" while why-us section said "15+ years". Standardized on 15+ (the more specific number).

8. **Design spec should match rendered output** — If the implementation intentionally diverges from the spec, update the spec immediately to avoid confusion.
