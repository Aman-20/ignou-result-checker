import { useMemo, useRef } from 'react'
import ExportButtons from './ExportButtons'
import { summariseAssignments } from '../utils/calc'
import { safeFilename } from '../utils/exportUtils'
import './Results.css'

const CATEGORY_LABEL = { evaluated: 'Marks recorded', in_process: 'In process at HQ', other: 'Other' }
const CATEGORY_CLASS = { evaluated: 'ok', in_process: 'warn', other: 'muted' }

export default function AssignmentResult({ status }) {
  const ref = useRef(null)
  const summary = useMemo(() => summariseAssignments(status), [status])

  // Newest first; rows with an unreadable date go last.
  const rows = useMemo(
    () => [...status.rows].sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || '')),
    [status],
  )

  return (
    <section className="result-card" ref={ref}>
      <div className="result-card__top">
        <div>
          <h2>Assignment / practical status</h2>
          <p className="result-card__meta">
            Enrolment {status.enrolmentNo} · {status.programmeCode}
            {status.asOn && <> · as on {status.asOn}</>}
          </p>
        </div>
        <ExportButtons targetRef={ref} filename={safeFilename(`assignments_${status.enrolmentNo}`)} />
      </div>

      <div className="stats">
        <div className="stat"><b>{summary.total}</b><span>Submissions</span></div>
        <div className="stat stat--ok"><b>{summary.evaluated}</b><span>Marks recorded</span></div>
        <div className="stat stat--warn"><b>{summary.inProcess}</b><span>In process</span></div>
        <div className="stat stat--primary"><b>{summary.evaluatedPercentage}%</b><span>Evaluated</span></div>
      </div>

      <div className="progress" aria-label={`${summary.evaluatedPercentage}% of submissions have marks recorded`}>
        <div className="progress__bar" style={{ width: `${summary.evaluatedPercentage}%` }} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Type</th><th>Course</th><th>Session</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.kind}-${r.course}-${r.session}-${i}`}>
                <td className="cell-title" data-label="Type">{r.kind}</td>
                <td data-label="Course"><strong>{r.course}</strong></td>
                <td data-label="Session">{r.session}</td>
                <td data-label="Status">
                  <span className={`badge badge--${CATEGORY_CLASS[r.category]}`}>{CATEGORY_LABEL[r.category]}</span>
                  <div className="status-text">{r.statusText}</div>
                </td>
                <td data-label="Date">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="notes">
        <li>&ldquo;Marks recorded&rdquo; means IGNOU has updated your marks. See the grade card for the marks themselves.</li>
      </ul>
    </section>
  )
}
