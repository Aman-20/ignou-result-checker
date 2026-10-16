// Pure parsing helpers. They only need a DOMParser, so they run in the browser
// and in Node (with jsdom) for testing. IGNOU's HTML is malformed, and the HTML5
// parser behind DOMParser is forgiving enough to cope with it.

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

export const clean = (s) => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()

// "BCS041" and "BCS41" are the same course. Strip leading zeros from the number part.
export function normaliseCourseCode(code) {
  const c = clean(code).toUpperCase()
  const m = c.match(/^([A-Z]+)0*(\d+)$/)
  return m ? `${m[1]}${m[2]}` : c
}

// "7-Oct-2026" -> "2026-10-07"
export function toIsoDate(text) {
  const m = clean(text).match(/^(\d{1,2})-([A-Za-z]{3})[a-z]*-(\d{4})$/)
  if (!m) return null
  const month = MONTHS[m[2].toLowerCase()]
  if (!month) return null
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`
}

function categoriseStatus(text) {
  const t = text.toLowerCase()
  if (t.includes('check grade card')) return 'evaluated'
  if (t.includes('received and in-process') || t.includes('in-process')) return 'in_process'
  return 'other'
}

const parseHtml = (html) => new DOMParser().parseFromString(html, 'text/html')

/**
 * Parse the assignment status page.
 * @returns {{ found: boolean, programmeCode: string, asOn: string, rows: object[] } | null}
 *          null means the page matched no known case (unexpected page).
 */
export function parseAssignmentStatus(html) {
  if (/Submission Status Not found/i.test(html)) {
    return { found: false, programmeCode: '', asOn: '', rows: [] }
  }

  const doc = parseHtml(html)
  const rows = []

  doc.querySelectorAll('tr').forEach((tr) => {
    // direct td children only, so outer layout rows that wrap nested tables are skipped
    const cells = Array.from(tr.children).filter((el) => el.tagName === 'TD')
    if (cells.length !== 5) return
    const texts = cells.map((c) => clean(c.textContent))
    if (texts[0].toLowerCase() === 'name') return
    const [kind, course, session, statusText, date] = texts
    rows.push({
      kind,
      course,
      courseKey: normaliseCourseCode(course),
      session,
      statusText,
      category: categoriseStatus(statusText),
      date,
      dateIso: toIsoDate(date),
    })
  })

  if (!rows.length) return null

  const bodyText = clean(doc.body?.textContent || '')
  const prog = bodyText.match(/Program:\s*(\S+)/i)
  const asOn = bodyText.match(/Status as on\s+(.+?\d{1,2}:\d{2}:\d{2}\s*[AP]M)/i)

  return {
    found: true,
    programmeCode: prog ? prog[1] : '',
    asOn: asOn ? asOn[1] : '',
    rows,
  }
}

/** Find the programme <select> (the one with many options) on the status page. */
export function parseProgrammeOptions(html) {
  const doc = parseHtml(html)
  let best = null
  doc.querySelectorAll('select').forEach((sel) => {
    if (!best || sel.options.length > best.options.length) best = sel
  })
  if (!best || best.options.length < 10) return []
  return Array.from(best.options)
    .map((o) => ({ code: clean(o.value), name: clean(o.textContent) }))
    .filter((o) => o.code && !/^select/i.test(o.name) && o.code !== '0')
}

function parseMark(raw) {
  const t = clean(raw)
  if (!/^\d+(\.\d+)?$/.test(t)) return null // "-" means not recorded, never zero
  return Number(t)
}

function parseCourseStatus(raw) {
  const t = clean(raw).toUpperCase()
  if (t.includes('NOT COMPLETED')) return 'not_completed' // test before COMPLETED
  if (t.includes('COMPLETED')) return 'completed'
  return 'unknown'
}

/**
 * Parse the grade card page.
 * @returns {{ valid: boolean, unexpected?: boolean, ... }}
 *   valid:false + unexpected:false -> container present but no table (no record for this type)
 *   valid:false + unexpected:true  -> page matches nothing we know
 */
export function parseGradeCard(html) {
  const doc = parseHtml(html)
  const container = doc.getElementById('ctl00_ContentPlaceHolder1_RegistrationPreview')
  if (!container) return { valid: false, unexpected: true }

  const table = doc.getElementById('ctl00_ContentPlaceHolder1_gvDetail')
  if (!table) return { valid: false, unexpected: false }

  const trs = Array.from(table.querySelectorAll('tr'))
  const headerRow = trs.find((tr) => tr.querySelector('th'))
  if (!headerRow) return { valid: false, unexpected: true }
  const labels = Array.from(headerRow.querySelectorAll('th')).map((th) => clean(th.textContent))

  const courses = []
  trs.forEach((tr) => {
    if (tr === headerRow) return
    const cells = Array.from(tr.children).filter((el) => el.tagName === 'TD')
    if (!cells.length) return
    const texts = cells.map((c) => clean(c.textContent))
    if (!texts[0]) return // trailing &nbsp; row

    const components = []
    let status = 'unknown'
    labels.forEach((label, i) => {
      if (i === 0) return
      const raw = texts[i] ?? ''
      if (/^status$/i.test(label)) {
        status = parseCourseStatus(raw)
      } else {
        components.push({ label, raw, value: parseMark(raw) })
      }
    })
    courses.push({ code: texts[0], key: normaliseCourseCode(texts[0]), components, status })
  })

  if (!courses.length) return { valid: false, unexpected: false }

  const txt = (id) => clean(doc.getElementById(id)?.textContent)
  return {
    valid: true,
    studentName: txt('ctl00_ContentPlaceHolder1_lblDispname'),
    enrolmentNo: txt('ctl00_ContentPlaceHolder1_lblDispEnrolno'),
    programmeCode: txt('ctl00_ContentPlaceHolder1_lblDispProgCode'),
    asOn: txt('ctl00_ContentPlaceHolder1_lblgcasondt'),
    columns: labels.slice(1),
    courses,
  }
}
