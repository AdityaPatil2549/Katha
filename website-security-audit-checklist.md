cd 

# Website Security Audit Checklist

**Target:** https://katha-9eda9.web.app (Firebase Hosting)
**Purpose:** Self-service hardening guide — run these checks yourself, only against assets you own.

---

## 0. Legal / Ground Rules

- Only run active scans (ZAP, Nikto, sqlmap, Burp intruder, nmap, etc.) against domains/projects **you own or control**, ideally from an account/IP you can tie back to yourself.
- If this project has other collaborators, get sign-off before running anything "active" (brute-force auth, fuzzing forms) — even on your own app, aggressive scans can trip Firebase quotas/costs or trigger abuse alerts on your Google Cloud project.
- Keep a private log of what you tested and when — useful if you ever need to prove it was you.

---

## 1. Firebase-Specific Hardening (do this FIRST — highest impact)

Since your site is on `*.web.app`, this is almost certainly a Firebase project. This is where most real breaches happen.

### 1.1 Firestore / Realtime Database Rules

- [ ] Open Firebase Console → Firestore/Realtime DB → **Rules**. Default rules (`allow read, write: if true;`) are an open database — check this is NOT what you have.
- [ ] Rules should require auth: `allow read, write: if request.auth != null;` at minimum, and field/owner-level checks for anything sensitive (`request.auth.uid == resource.data.ownerId`).
- [ ] Test rules with the **Firebase Rules Playground** (Console → Rules → "Rules Playground") — simulate reads/writes as an anonymous/unauthenticated user and confirm they're denied.
- [ ] Use the Firebase emulator + `@firebase/rules-unit-testing` npm package to write automated rule tests (catches regressions when you edit rules later).

### 1.2 Cloud Storage Rules

- [ ] Same as above but under Storage → Rules. Open storage buckets are a classic Firebase leak (anyone can list/download uploaded files).

### 1.3 API Key Restrictions

Firebase web API keys are **meant** to be public (they're in your JS bundle, that's normal) — but they must be restricted so they can't be abused:

- [ ] Go to Google Cloud Console → APIs & Services → Credentials → your Firebase API key.
- [ ] Set **Application restrictions** → HTTP referrers → add only `katha-9eda9.web.app/*` and any custom domains.
- [ ] Set **API restrictions** → limit to only the Firebase services you actually use (Identity Toolkit, Firestore, Storage, etc.) — not "unrestricted."

### 1.4 Authentication

- [ ] Enable only the sign-in providers you actually use; disable unused ones.
- [ ] Enforce email verification if email/password auth is enabled.
- [ ] Set up **App Check** (Console → App Check) — this stops non-browser bots/scripts from hammering your backend even if they have your API key. Biggest single upgrade most Firebase apps skip.
- [ ] Add reCAPTCHA / rate limiting on any public form (signup, contact, comments).

### 1.5 Cloud Functions (if used)

- [ ] Never trust client-submitted data — validate everything server-side in the function, even if you validated it in the frontend.
- [ ] Check function IAM — make sure functions aren't set to `allUsers` invoker unless they're meant to be fully public.
- [ ] Store secrets (API keys, service credentials) in **Secret Manager** or `functions:config`, never hardcoded in source.

### 1.6 Firebase Hosting Config

Add security headers via `firebase.json` (most Firebase sites ship with none of these by default):

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
          { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=()" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.firebaseio.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" }
        ]
      }
    ]
  }
}
```

Tighten the CSP to your actual script/style/connect sources once you know exactly what your app loads — start strict and open up only what breaks.

---

## 2. Standard Web App Checklist (OWASP Top 10 mapped)

| #  | Risk                      | What to check                                                                                                                                                                                                                                         |
| -- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Broken Access Control     | Can a logged-out or low-privilege user reach admin routes/data by guessing URLs or IDs? Test with dev tools / Burp, not just the UI.                                                                                                                  |
| 2  | Cryptographic Failures    | All traffic on HTTPS only (Firebase Hosting enforces this by default — verify no mixed content warnings in browser console). No secrets in client JS bundle (`view-source:` your site, search for `key`, `secret`, `password`).              |
| 3  | Injection (XSS/SQLi)      | If you render any user input via`innerHTML`/`dangerouslySetInnerHTML`, that's an XSS risk — should be sanitized (DOMPurify) or avoided. Firestore isn't SQL so classic SQLi doesn't apply, but NoSQL injection via unvalidated query params can. |
| 4  | Insecure Design           | Are there rate limits / abuse limits on forms, login, password reset?                                                                                                                                                                                 |
| 5  | Security Misconfiguration | Headers (see §1.6), default Firebase rules, verbose error messages leaking stack traces.                                                                                                                                                             |
| 6  | Vulnerable Components     | Run`npm audit` / `npm audit fix` on your project; check for outdated frontend framework versions.                                                                                                                                                 |
| 7  | Auth Failures             | Password policy, no default/test accounts left enabled, session/token expiry configured.                                                                                                                                                              |
| 8  | Data Integrity Failures   | Are you loading any third-party scripts from CDNs without Subresource Integrity (`integrity="sha384-..."` attribute)?                                                                                                                               |
| 9  | Logging & Monitoring      | Firebase Console → project has usage/error alerting set up (budget alerts, Crashlytics/Analytics anomaly detection).                                                                                                                                 |
| 10 | SSRF                      | Only relevant if your Cloud Functions fetch arbitrary user-supplied URLs — validate/allowlist targets if so.                                                                                                                                         |

---

## 3. Tools You Can Run Yourself

**Passive / non-intrusive (safe to run anytime, no auth needed):**

- [Mozilla Observatory](https://observatory.mozilla.org/) — scans headers, CSP, cookies; free, instant grade.
- [securityheaders.com](https://securityheaders.com/) — quick header-only scan.
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/) — TLS/certificate config grade.
- `testssl.sh` (open source, run locally) — deep TLS/cipher audit: `github.com/drwetter/testssl.sh`

**Active scanning (run against your own project, self-hosted):**

- **OWASP ZAP** (free, GUI + CLI) — automated crawl + vuln scan: `github.com/zaproxy/zaproxy`
- **Nuclei** (ProjectDiscovery) — fast template-based vuln scanner: `github.com/projectdiscovery/nuclei`
- **Nikto** — classic web server misconfig scanner: `github.com/sullo/nikto`
- **Burp Suite Community Edition** — manual request tampering, proxy inspection: portswigger.net/burp
- **npm audit** / **Snyk CLI** — dependency vulnerability scanning for your codebase.

**Firebase-specific:**

- `firebase-tools` CLI: `firebase deploy --only firestore:rules` after testing rules changes.
- `@firebase/rules-unit-testing` — automated Firestore/Storage rule tests in CI.
- [Firebase Security Checklist (official)](https://firebase.google.com/support/guides/security-checklist)

---

## 4. Key Docs / Reading

- [OWASP Top 10 (2021)](https://owasp.org/Top10/) — the industry-standard risk list used above.
- [OWASP Web Security Testing Guide (WSTG)](https://owasp.org/www-project-web-security-testing-guide/) — step-by-step manual testing methodology.
- [Firebase Security Rules docs](https://firebase.google.com/docs/rules)
- [Firebase App Check docs](https://firebase.google.com/docs/app-check)
- [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [Google Cloud: Best practices for API keys](https://cloud.google.com/docs/authentication/api-keys-best-practices)

---

## 5. Suggested Order of Operations

1. Lock down Firestore/Storage rules + API key restrictions (§1.1–1.3) — biggest risk, fastest fix.
2. Add security headers to `firebase.json` (§1.6) and redeploy.
3. Run Mozilla Observatory + SSL Labs scans — fix what they flag.
4. `npm audit` your codebase, patch/upgrade dependencies.
5. Enable App Check + rate limiting on public forms.
6. Run OWASP ZAP baseline scan against the live site for anything left.
7. Re-test headers/rules after changes; repeat quarterly or before major releases.
