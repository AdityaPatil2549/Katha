# Katha Security & Privacy Architecture

At Katha, we treat your personal media history, quotes, and reflections as private personal records. Below is an accurate overview of how your data is stored, protected, and optionally synced.

## 🏠 Local-First Storage by Default
* **IndexedDB Vault**: Without signing in, all stories, moments, sessions, and knowledge records remain on your device inside browser IndexedDB (managed via Dexie.js).
* **No Mandatory Cloud Account**: You can use the full local vault without creating or linking a cloud account.

## ☁️ Optional Cloud Infrastructure & Compliance
When you explicitly choose to sign in with Google, Katha uses **Google Cloud Firebase** (Authentication & Cloud Firestore) and optional **Google Drive AppData**:
* **Inherited Infrastructure Standards**: Google Cloud / Firebase maintains SOC 1/2/3 and ISO/IEC 27001/27017/27018 compliance for underlying cloud storage. *(Note: Katha itself is an independent open-source application and has not undergone third-party security audits.)*
* **In Transit**: All client-server and API traffic uses **HTTPS/TLS**.
* **Cloud Sync Partitioning**: Firestore records and local offline outbox queue items are scoped by authenticated user UID (`userId`).

## 🛡️ Edge API & Client Hardening
* **Authenticated AI Proxy**: `/api/gemini` requires a valid Firebase ID Bearer token (`verifyFirebaseBearerToken`) and validates request payloads with strict Zod bounds.
* **SSRF Prevention**: Metadata proxy routes (`/api/tmdb`, `/api/jikan`, `/api/omdb`, etc.) reject absolute URLs, `//` protocol-relative paths, and `..` traversal segments via `validateRelativePath`.
* **Content Security Policy**: `index.html` enforces a strict CSP without `'unsafe-eval'`, restricts `connect-src` to explicit trusted origins, and limits form actions/frame ancestors.

## 🐛 Vulnerability Disclosure
If you discover a security issue in Katha, please report it responsibly before public disclosure so it can be patched promptly.

## 📜 Security Changelog
* **Current Baseline**: Local-first IndexedDB storage, UID-scoped offline sync outbox, hardened Edge API proxies (`api/_lib/proxy.ts` & `api/_lib/rate-limit.ts`), and verified `.docx` / `.pdf` / `.md` / `.json` client-side exports. 
