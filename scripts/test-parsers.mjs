// Runs the parsers against the sample markup from IGNOU_ENDPOINTS.md.
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

globalThis.DOMParser = new JSDOM('').window.DOMParser

const { parseAssignmentStatus, parseGradeCard, parseProgrammeOptions, normaliseCourseCode, toIsoDate } =
  await import('../src/utils/parsers.js')
const { summariseGradeCard, summariseAssignments } = await import('../src/utils/calc.js')

// ---- assignment status (malformed on purpose, as IGNOU's is) ----
const assignmentHtml = `
<font class=cfont><div align=right><font size=1>Status as on 15-Oct-2026 12:24:10 PM</font></div></font>
<div align=center><table ...><tr class=td2><td ...><div align=center><table class=bkctable>
<tr class=tdheader><td colspan=5>Assignment/Practical/Project Marks/Awards Transmission Status* ...</td></tr>
<tr class=td2><td colspan=5><div align=center><font size=+1>Enrollment No.: 2000000001 | Program: BCA_NEW </td></tr>
<tr class=td1><td><b>Name</td><td><b>Course</td><td><b>Session</td><td><b>Status</td><td><b><div align=center>Date</td></tr>
<tr class=td2><td>Assignment</td><td>BCS012</td><td>Dec-2024</td><td>Check Grade Card Status for detail.</td><td><div align=center>13-May-2025</td></tr>
<tr class=td1><td>Assignment</td><td>BCS41</td><td>Jun-2026</td><td>Received and in-process at Headquarter for updation.</td><td><div align=center>7-Oct-2026</td></tr>
<tr class=td2><td>Practical</td><td>BCSL135</td><td>Dec-2025</td><td>Check Grade Card Status for detail.</td><td><div align=center>4-Aug-2026</td></tr>
</table></table>`

const a = parseAssignmentStatus(assignmentHtml)
assert.equal(a.found, true)
assert.equal(a.rows.length, 3)
assert.equal(a.programmeCode, 'BCA_NEW')
assert.equal(a.asOn, '15-Oct-2026 12:24:10 PM')
assert.deepEqual(a.rows.map((r) => r.category), ['evaluated', 'in_process', 'evaluated'])
assert.equal(a.rows[1].dateIso, '2026-10-07')
assert.equal(a.rows[1].courseKey, 'BCS41')
const as = summariseAssignments(a)
assert.equal(as.evaluated, 2)
assert.equal(as.evaluatedPercentage, 66.7)

const notFound = parseAssignmentStatus(
  '<p><font class=c2font>Enrollment No.2000000002 and Program BCA_NEW\nAssignment/Project/Practical Submission Status Not found.<br>Kindly check',
)
assert.equal(notFound.found, false)
assert.equal(parseAssignmentStatus('<html><body>Server error</body></html>'), null)

// ---- grade card ----
const gradeHtml = `
<form><div id="ctl00_ContentPlaceHolder1_RegistrationPreview" style="display: block">
  <span id="ctl00_ContentPlaceHolder1_lblgcasondt">14-10-2026</span>
  <span id="ctl00_ContentPlaceHolder1_lblDispEnrolno">2000000001</span>
  <span id="ctl00_ContentPlaceHolder1_lblDispname"></span>
  <span id="ctl00_ContentPlaceHolder1_lblDispProgCode">BCA_NEW</span>
<table id="ctl00_ContentPlaceHolder1_gvDetail" cellspacing="0" cellpadding="8" border="0">
  <tr><th scope="col">COURSE</th><th scope="col">Asgn1</th><th scope="col">LAB1</th><th scope="col">LAB2</th>
      <th scope="col">LAB3</th><th scope="col">LAB4</th><th scope="col">TERM END THEORY</th><th scope="col">STATUS</th></tr>
  <tr><td>BCS012</td><td>63</td><td>-</td><td>-</td><td>-</td><td>-</td><td>60</td><td>COMPLETED</td></tr>
  <tr><td>BCS040</td><td>67</td><td>-</td><td>-</td><td>-</td><td>-</td><td>16</td><td>NOT
      COMPLETED</td></tr>
  <tr><td>BCSL013</td><td>76</td><td>79</td><td>-</td><td>-</td><td>-</td><td>-</td><td>COMPLETED</td></tr>
  <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
</table></div></form>`

const g = parseGradeCard(gradeHtml)
assert.equal(g.valid, true)
assert.equal(g.courses.length, 3, 'blank trailing row ignored')
assert.equal(g.studentName, '', 'empty name still valid')
assert.deepEqual(g.courses.map((c) => c.status), ['completed', 'not_completed', 'completed'])
assert.equal(g.courses[0].components.find((c) => c.label === 'LAB1').value, null, 'dash is not zero')
assert.equal(g.courses[1].components.find((c) => c.label === 'TERM END THEORY').value, 16)

const gs = summariseGradeCard(g)
assert.equal(gs.perCourse[0].percentage, 60.9) // 0.3*63 + 0.7*60
assert.equal(gs.perCourse[1].belowTermEndPass, true)
// pass mark is 40: 39 fails, 40 passes
const mk = (v) => ({ components: [{ label: 'TERM END THEORY', raw: String(v), value: v }] })
const { summariseCourse } = await import('../src/utils/calc.js')
assert.equal(summariseCourse(mk(39)).belowTermEndPass, true)
assert.equal(summariseCourse(mk(40)).belowTermEndPass, false)
assert.equal(gs.perCourse[2].percentage, 77.5)
assert.equal(gs.completed, 2)
assert.equal(gs.notCompleted, 1)

const emptyGrade = parseGradeCard(`<div id="ctl00_ContentPlaceHolder1_RegistrationPreview"><span id="ctl00_ContentPlaceHolder1_lblDispEnrolno"></span></div>`)
assert.deepEqual(emptyGrade, { valid: false, unexpected: false })
assert.deepEqual(parseGradeCard('<html>oops</html>'), { valid: false, unexpected: true })

// ---- helpers ----
assert.equal(normaliseCourseCode('BCS041'), 'BCS41')
assert.equal(normaliseCourseCode('bcsl013'), 'BCSL13')
assert.equal(toIsoDate('4-Aug-2026'), '2026-08-04')

const opts = parseProgrammeOptions(
  `<select name=program><option value="">Select</option>${Array.from({ length: 12 }, (_, i) => `<option value="P${i}">Programme ${i}</option>`).join('')}</select>`,
)
assert.equal(opts.length, 12)

console.log('All parser tests passed.')
