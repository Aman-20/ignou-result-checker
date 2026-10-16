import { parseAssignmentStatus, parseGradeCard, parseProgrammeOptions } from '../utils/parsers'

const ISMS_URL = '/api/proxy/isms/changeadmdata/StatusAssignment.ASP'
const GRADE_URL = '/api/proxy/gradecard/view_gradecard.aspx'
const TIMEOUT_MS = 30000
const RETRIES = 2
const TYPE_CACHE_KEY = 'ignou_gradecard_type_by_programme'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export class ApiError extends Error {
  constructor(message, kind = 'network') {
    super(message)
    this.kind = kind // 'network' | 'unexpected'
  }
}

// Retries timeouts, network errors, 5xx and 429. 4xx (other than 429) are not retried.
const UNREACHABLE_MSG =
  "Could not reach IGNOU's server. Check your internet connection, DNS or VPN. IGNOU's site may also be down, so try again in a few minutes."

async function fetchHtml(url, options = {}, retries = RETRIES) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let retryable = true
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      if (res.ok) return await res.text()
      retryable = res.status === 429 || res.status >= 500
      // The dev proxy answers with an empty 5xx body when it cannot reach IGNOU at all
      // (DNS failure, no internet). A real IGNOU error page has a body.
      const body = res.status >= 500 ? (await res.text().catch(() => '')).trim() : 'x'
      lastError = new ApiError(body ? `IGNOU server returned ${res.status}.` : UNREACHABLE_MSG)
    } catch (err) {
      lastError = new ApiError(
        err.name === 'AbortError' ? 'The IGNOU server took too long to respond.' : UNREACHABLE_MSG,
      )
    } finally {
      clearTimeout(timer)
    }
    if (!retryable || attempt === retries) break
    await sleep(800 * (attempt + 1))
  }
  throw lastError
}

const readTypeCache = () => {
  try {
    return JSON.parse(localStorage.getItem(TYPE_CACHE_KEY)) || {}
  } catch {
    return {}
  }
}
const writeTypeCache = (programme, type) => {
  try {
    localStorage.setItem(TYPE_CACHE_KEY, JSON.stringify({ ...readTypeCache(), [programme]: type }))
  } catch {
    /* storage unavailable, not critical */
  }
}

export async function fetchAssignmentStatus(enrolmentNo, programme) {
  const body = new URLSearchParams({ EnrNo: enrolmentNo, program: programme, Submit: 'Submit' })
  const html = await fetchHtml(ISMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const parsed = parseAssignmentStatus(html)
  if (!parsed) throw new ApiError('IGNOU returned a page we do not recognise. The site may have changed.', 'unexpected')
  return { ...parsed, enrolmentNo, programmeCode: parsed.programmeCode || programme }
}

export async function fetchGradeCard(enrolmentNo, programme) {
  const cached = readTypeCache()[programme]
  const order = [1, 2, 3, 4]
  if (cached) order.sort((a, b) => (a === cached ? -1 : b === cached ? 1 : a - b))

  let sawUnexpected = false
  for (const type of order) {
    const qs = new URLSearchParams({ eno: enrolmentNo, prog: programme, type: String(type) })
    const html = await fetchHtml(`${GRADE_URL}?${qs}`)
    const parsed = parseGradeCard(html)
    if (parsed.valid) {
      writeTypeCache(programme, type)
      return { ...parsed, enrolmentNo, programmeCode: parsed.programmeCode || programme, type }
    }
    if (parsed.unexpected) sawUnexpected = true
  }
  if (sawUnexpected) {
    throw new ApiError('IGNOU returned a page we do not recognise. The site may have changed.', 'unexpected')
  }
  return null // no record under any grade card type
}

const PROGRAMME_CACHE_KEY = 'ignou_programmes_v1'
const PROGRAMME_CACHE_MS = 7 * 24 * 60 * 60 * 1000

// The list rarely changes, so keep it for a week. One attempt only: it is just a
// convenience for the suggestions, and the form works without it.
export async function fetchProgrammes() {
  try {
    const cached = JSON.parse(localStorage.getItem(PROGRAMME_CACHE_KEY))
    if (cached && Date.now() - cached.at < PROGRAMME_CACHE_MS && cached.list?.length) return cached.list
  } catch {
    /* ignore a corrupt or unavailable cache */
  }

  const html = await fetchHtml(ISMS_URL, { method: 'GET' }, 0)
  const list = parseProgrammeOptions(html)
  if (list.length) {
    try {
      localStorage.setItem(PROGRAMME_CACHE_KEY, JSON.stringify({ at: Date.now(), list }))
    } catch {
      /* storage unavailable, not critical */
    }
  }
  return list
}