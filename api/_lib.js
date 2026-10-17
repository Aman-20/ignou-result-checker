// Shared helpers for the Vercel functions in this folder.
// Files starting with an underscore are not exposed as endpoints by Vercel.
//
// These functions are NOT an open proxy: each endpoint reaches exactly one fixed IGNOU URL,
// only fields we know about are forwarded, and every value is validated.
// Enrolment numbers are never logged.

export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export const ISMS_ORIGIN = 'https://isms.ignou.ac.in'
export const ISMS_URL = `${ISMS_ORIGIN}/changeadmdata/StatusAssignment.ASP`
export const GRADE_URL = 'https://gradecard.ignou.ac.in/view_gradecard.aspx'

export const ENROLMENT_RE = /^[A-Za-z0-9]{9,10}$/
export const PROGRAMME_RE = /^[A-Za-z0-9_-]{1,40}$/
export const TYPE_RE = /^[1-4]$/

const TIMEOUT_MS = 28000

// Our own short replies (errors). The X-Proxy header tells you the reply came from this
// function and not from IGNOU: check it in the browser's Network tab when debugging.
export function reply(res, status, text = '') {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('X-Proxy', 'ignou-checker')
  res.status(status).send(text)
}

// Query parameters, read from the URL and (as a fallback) from req.query.
export function getParams(req) {
  const params = new URLSearchParams(new URL(req.url || '/', 'http://localhost').search)
  if (req.query && typeof req.query === 'object') {
    for (const [k, v] of Object.entries(req.query)) {
      if (!params.has(k)) params.set(k, Array.isArray(v) ? String(v[0]) : String(v))
    }
  }
  return params
}

// Form body, whether Vercel parsed it into an object or left it as a string/Buffer.
export function readForm(req) {
  const b = req.body
  if (typeof b === 'string') return new URLSearchParams(b)
  if (Buffer.isBuffer(b)) return new URLSearchParams(b.toString('utf8'))
  return new URLSearchParams(b && typeof b === 'object' ? b : {})
}

// Makes the real request to IGNOU and relays the answer.
export async function forward(res, target, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const upstream = await fetch(target, {
      ...init,
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*', ...init.headers },
      signal: controller.signal,
      redirect: 'follow',
    })
    const html = await upstream.text()
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('X-Proxy', 'ignou-checker')
    res.setHeader('X-Upstream-Status', String(upstream.status))
    res.status(upstream.status).send(html)
  } catch {
    // Empty 502 = "could not reach IGNOU". The app shows a friendly message for this.
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Proxy', 'ignou-checker')
    res.status(502).end()
  } finally {
    clearTimeout(timer)
  }
}
