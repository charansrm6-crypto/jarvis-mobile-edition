# J.A.R.V.I.S Mobile Edition — Upgrade & Setup

This project is a static GitHub Pages frontend plus a separate Cloudflare Worker that keeps the Gemini API key on the server.

## What changed
- Removed direct Gemini API calls and browser-local Gemini API key storage from the frontend.
- Added a Cloudflare Worker proxy (`cloudflare-worker/worker.js`) with origin checks, request-size limits, method validation, no-store responses, and upstream timeout.
- Added Settings field to save the public Worker URL (`https://YOUR-WORKER.workers.dev/api/chat`). Image analysis uses `/api/vision` automatically.
- Removed the external Orbs dependency; the animated orb now uses the app's local CSS.
- Added PNG/SVG PWA icons, corrected manifest start URL/scope, install prompt, service worker shell caching and offline app shell.
- Added image type/size checks, fetch timeouts, clearer error messages, and mobile spacing improvements.
- Kept the original frontend directory and also copied publishing files to the repository root because GitHub Pages is configured for `main` / root.

## A. Deploy the frontend to GitHub Pages
1. Upload/replace the root-level `index.html`, `script.js`, `style.css`, `manifest.json`, `service-worker.js`, and `icons/` directory in your repository.
2. Keep GitHub Pages set to `main` and `/(root)`.
3. Commit and wait for the Pages deployment to complete.

## B. Deploy the secure Gemini proxy to Cloudflare Workers
1. In Cloudflare Dashboard, open **Workers & Pages** and create a Worker (for example `jarvis-gemini-proxy`).
2. Paste the contents of `cloudflare-worker/worker.js` into the Worker editor and deploy.
3. In the Worker settings, add a **secret** named `GEMINI_API_KEY` containing your Google AI Studio key. Do not put this key in GitHub or the frontend.
4. Add a plain-text variable named `ALLOWED_ORIGIN` with value `https://charansrm6-crypto.github.io`. If you use a custom domain, include its exact origin in this comma-separated list. Do not include a trailing slash.
5. Redeploy if Cloudflare asks.
6. Your Worker URL will look like `https://jarvis-gemini-proxy.YOUR-SUBDOMAIN.workers.dev`.

## C. Connect the frontend
1. Open `https://charansrm6-crypto.github.io/jarvis-mobile-edition/`.
2. Open **Settings**.
3. In **Secure AI server URL**, enter `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/chat` using your actual Worker URL.
4. Select **Save server URL**, then send a short test message.
5. Try image analysis after chat works; it calls `/api/vision` on the same Worker.

## Security notes
- The Gemini key is a Cloudflare secret, not a browser setting. The app also removes the old `jarvis_key` value from local storage when the upgraded script first runs. If a key was previously exposed or pasted into public code/screenshots, revoke it in Google AI Studio and create a replacement.
- The Worker only allows origins listed in `ALLOWED_ORIGIN`, but origin checks are not user authentication. Public websites can still be used by visitors. Set billing/quota limits in Google AI Studio and add Cloudflare rate limiting/WAF rules to `/api/*` before sharing widely.
- Never commit secrets to this repository. Avoid logging request bodies or API keys.

## Voice and wake word limitations
- Voice recognition depends on browser support, microphone permission, HTTPS, and may stop when the tab is backgrounded. Wake-word detection is not guaranteed to run continuously in the background on mobile browsers; return to the app if it pauses.
- Speech synthesis depends on installed browser/device voices. The app chooses a Telugu voice when available, otherwise it falls back to an English/Indian locale.

## Offline/PWA notes
- The app shell can load offline after it has been visited online once. AI replies, live weather/news/crypto, and speech recognition still require their respective services/permissions.
- HTTPS is required for service workers and most microphone features. GitHub Pages provides HTTPS.

## Tests performed
- JavaScript syntax checked with Node.js.
- Manifest and service-worker JSON/source validation performed.
- Checked app HTML IDs against script lookups and verified expected files exist.
- Live Gemini calls, Cloudflare deployment, microphone behavior, and install prompt cannot be verified from this build environment; follow the setup steps and test in your browser.
