// GET /api/gradecard?eno=...&prog=...&type=1  -> IGNOU grade card page
import { reply, forward, getParams, ENROLMENT_RE, PROGRAMME_RE, TYPE_RE, GRADE_URL } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return reply(res, 405, 'Method not allowed')

  const params = getParams(req)
  const eno = (params.get('eno') || '').trim()
  const prog = (params.get('prog') || '').trim()
  const type = (params.get('type') || '').trim()
  if (!ENROLMENT_RE.test(eno) || !PROGRAMME_RE.test(prog) || !TYPE_RE.test(type)) {
    return reply(res, 400, 'Invalid input')
  }

  return forward(res, `${GRADE_URL}?${new URLSearchParams({ eno, prog, type })}`, { method: 'GET' })
}
