# J.A.R.V.I.S Mobile Edition

Personal AI assistant with a mobile-friendly interface, voice input/output, image analysis, local conversation history, quick tools, and PWA support.

**For secure Gemini setup, follow [SETUP.md](./SETUP.md).** The frontend no longer accepts or stores a Gemini API key; deploy the Cloudflare proxy and save its `/api/chat` URL in app Settings.

## Features
- Gemini-backed chat and image analysis through a Cloudflare Worker proxy
- Voice input, speech output, optional “Hey Jarvis” wake-word mode (browser dependent)
- Conversation history and light/dark themes
- Weather, time, news, crypto price, translation, currency conversion, dictionary, timer, jokes, quotes, and other quick tools
- PWA manifest, install button, icons, and offline app shell

## Project layout
- `index.html`, `script.js`, `style.css`, `manifest.json`, `service-worker.js`, `icons/`: GitHub Pages root publishing files
- `frontend/`: matching app files kept for the original project layout
- `cloudflare-worker/worker.js`: secure Gemini API proxy
- `SETUP.md`: complete deployment instructions

Do not commit API keys or other secrets. For production use, configure provider quota limits and Cloudflare rate limiting as described in SETUP.md.
