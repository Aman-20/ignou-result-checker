// GET  /api/isms  -> IGNOU assignment status page (used for the programme list)
// POST /api/isms  -> IGNOU assignment/practical status lookup
import { reply, forward, readForm, ENROLMENT_RE, PROGRAMME_RE, ISMS_URL, ISMS_ORIGIN } from './_lib.js'

export default async function handler(req, res) {
  if (req.method === 'GET') return forward(res, ISMS_URL, { method: 'GET' })

  if (req.method === 'POST') {
    const form = readForm(req)
    const eno = String(form.get('EnrNo') || '').trim()
    const prog = String(form.get('program') || '').trim()
    if (!ENROLMENT_RE.test(eno) || !PROGRAMME_RE.test(prog)) return reply(res, 400, 'Invalid input')

    return forward(res, ISMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: ISMS_URL,
        Origin: ISMS_ORIGIN,
      },
      body: new URLSearchParams({ EnrNo: eno, program: prog, Submit: 'Submit' }).toString(),
    })
  }

  return reply(res, 405, 'Method not allowed')
}
