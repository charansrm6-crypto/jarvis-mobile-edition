#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const required = ['index.html','script.js','style.css','manifest.json','service-worker.js','cloudflare-worker/worker.js','icons/icon-192.svg','icons/icon-512.svg','icons/icon-192.png','icons/icon-512.png'];
let failed = false;
for (const file of required) { if (!fs.existsSync(path.join(root,file))) { console.error('MISSING',file); failed=true; } else console.log('OK',file); }
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
if (manifest.start_url !== './' || manifest.scope !== './' || !Array.isArray(manifest.icons) || manifest.icons.length < 2) { console.error('FAIL manifest fields'); failed=true; } else console.log('OK manifest');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const id of ['api-endpoint','save-api-endpoint','install-btn','jarvis-core-container','mic-btn','wake-btn']) if (!html.includes(`id="${id}"`)) { console.error('MISSING HTML id',id); failed=true; }
if (/x-goog-api-key|localStorage\.getItem\(['"]jarvis_key/.test(fs.readFileSync(path.join(root,'script.js'),'utf8'))) { console.error('FAIL frontend contains direct API key handling'); failed=true; } else console.log('OK frontend does not contain Gemini key handling');
if (!fs.readFileSync(path.join(root,'cloudflare-worker/worker.js'),'utf8').includes('env.GEMINI_API_KEY')) { console.error('FAIL worker secret binding missing'); failed=true; } else console.log('OK worker reads Gemini key from secret binding');
if (failed) process.exit(1); console.log('All static project checks passed.');
