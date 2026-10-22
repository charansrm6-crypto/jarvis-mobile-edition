/**
 * J.A.R.V.I.S secure Gemini proxy for Cloudflare Workers.
 * Required secret: GEMINI_API_KEY. Optional variable: ALLOWED_ORIGIN (comma-separated origins).
 * Deploy this Worker separately from GitHub Pages and save its /api/chat URL in app Settings.
 */
const DEFAULT_ORIGIN = 'https://charansrm6-crypto.github.io';
function allowedOrigins(env) { return String(env.ALLOWED_ORIGIN || DEFAULT_ORIGIN).split(',').map(v => v.trim()).filter(Boolean); }
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const headers = { 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' };
  if (allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}
function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } }); }
export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (url.pathname === '/' && request.method === 'GET') return new Response('J.A.R.V.I.S secure AI proxy is online.', { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
    if (!['/api/chat', '/api/vision'].includes(url.pathname)) return json({ error: 'Not found' }, 404, headers);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);
    const origin = request.headers.get('Origin') || '';
    if (origin && !allowedOrigins(env).includes(origin)) return json({ error: 'Origin is not allowed.' }, 403, headers);
    if (!env.GEMINI_API_KEY) return json({ error: 'Server is missing GEMINI_API_KEY.' }, 500, headers);
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 10 * 1024 * 1024) return json({ error: 'Request too large. Use an image under 6 MB.' }, 413, headers);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400, headers); }
    if (!body || !Array.isArray(body.input) || body.input.length > 30) return json({ error: 'Invalid input payload.' }, 400, headers);
    if (JSON.stringify(body.input).length > 10 * 1024 * 1024) return json({ error: 'Request too large.' }, 413, headers);
    const payload = { model: 'gemini-3.8-flash', input: body.input, store: false };
    if (typeof body.system_instruction === 'string' && body.system_instruction.length < 12000) payload.system_instruction = body.system_instruction;
    let upstream;
    try {
      upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY, 'Api-Revision': '2026-05-20' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(40000)
      });
    } catch (error) { return json({ error: 'Gemini service could not be reached. Try again.' }, 502, headers); }
    const text = await upstream.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { error: { message: 'Gemini returned an invalid response.' } }; }
    return json(result, upstream.status, headers);
  }
};
