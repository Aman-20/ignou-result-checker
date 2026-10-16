// Vercel serverless function: forwards the app's requests to IGNOU.
//
// The browser cannot call IGNOU directly (no CORS headers), so in production the app calls
//   /api/proxy/isms/changeadmdata/StatusAssignment.ASP   (GET programme list, POST status)
//   /api/proxy/gradecard/view_gradecard.aspx?eno=&prog=&type=
// and this function makes the real request from the server.
//
// It is NOT an open proxy: only these two IGNOU endpoints are reachable, only fields we
// know about are forwarded, and the values are validated. Enrolment numbers are never logged.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const ISMS_ORIGIN = 'https://isms.ignou.ac.in'
const ISMS_URL = `${ISMS_ORIGIN}/changeadmdata/StatusAssignment.ASP`
const GRADE_URL = 'https://gradecard.ignou.ac.in/view_gradecard.aspx'

const ENROLMENT_RE = /^[A-Za-z0-9]{9,10}$/
const PROGRAMME_RE = /^[A-Za-z0-9_-]{1,40}$/
const TYPE_RE = /^[1-4]$/
const TIMEOUT_MS = 28000

const reply = (res, status, text = '') => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.status(status).send(text)
}

function readForm(req) {
  const b = req.body
  if (typeof b === 'string') return new URLSearchParams(b)
  if (Buffer.isBuffer(b)) return new URLSearchParams(b.toString('utf8'))
  return new URLSearchParams(b && typeof b === 'object' ? b : {})
}

export default async function handler(req, res) {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost')
  const route = pathname.replace(/^\/api\/proxy\//, '').replace(/\/+$/, '').toLowerCase()

  let target
  let init = { method: 'GET', headers: {} }

  if (route === 'isms/changeadmdata/statusassignment.asp') {
    target = ISMS_URL
    if (req.method === 'POST') {
      const form = readForm(req)
      const eno = String(form.get('EnrNo') || '').trim()
      const prog = String(form.get('program') || '').trim()
      if (!ENROLMENT_RE.test(eno) || !PROGRAMME_RE.test(prog)) return reply(res, 400, 'Invalid input')
      init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: ISMS_URL,
          Origin: ISMS_ORIGIN,
        },
        body: new URLSearchParams({ EnrNo: eno, program: prog, Submit: 'Submit' }).toString(),
      }
    } else if (req.method !== 'GET') {
      return reply(res, 405, 'Method not allowed')
    }
  } else if (route === 'gradecard/view_gradecard.aspx') {
    if (req.method !== 'GET') return reply(res, 405, 'Method not allowed')
    const eno = (searchParams.get('eno') || '').trim()
    const prog = (searchParams.get('prog') || '').trim()
    const type = (searchParams.get('type') || '').trim()
    if (!ENROLMENT_RE.test(eno) || !PROGRAMME_RE.test(prog) || !TYPE_RE.test(type)) {
      return reply(res, 400, 'Invalid input')
    }
    target = `${GRADE_URL}?${new URLSearchParams({ eno, prog, type })}`
  } else {
    return reply(res, 404, 'Not found')
  }

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
    res.status(upstream.status).send(html)
  } catch {
    // Empty 502 = "could not reach IGNOU". The app shows a friendly message for this.
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).end()
  } finally {
    clearTimeout(timer)
  }
}
