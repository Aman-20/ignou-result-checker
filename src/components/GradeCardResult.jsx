import { useMemo, useRef } from 'react'
import ExportButtons from './ExportButtons'
import { summariseGradeCard, TERM_END_PASS_MARK, classifyComponent } from '../utils/calc'
import { safeFilename } from '../utils/exportUtils'
import { PASS_NOTES } from '../config/siteInfo'
import './Results.css'

const STATUS_LABEL = { completed: 'Completed', not_completed: 'Not completed', unknown: 'Unknown' }
const STATUS_CLASS = { completed: 'ok', not_completed: 'bad', unknown: 'warn' }

export default function GradeCardResult({ card }) {
  const ref = useRef(null)
  const summary = useMemo(() => summariseGradeCard(card), [card])

  return (
    <section className="result-card" ref={ref}>
      <div className="result-card__top">
        <div>
          <h2>Grade card status</h2>
          <p className="result-card__meta">
            {card.studentName && <><strong>{card.studentName}</strong> · </>}
            Enrolment {card.enrolmentNo} · {card.programmeCode}
            {card.asOn && <> · as on {card.asOn}</>}
          </p>
        </div>
        <ExportButtons targetRef={ref} filename={safeFilename(`gradecard_${card.enrolmentNo}`)} />
      </div>

      <div className="stats">
        <div className="stat"><b>{summary.total}</b><span>Courses</span></div>
        <div className="stat stat--ok"><b>{summary.completed}</b><span>Completed</span></div>
        <div className="stat stat--bad"><b>{summary.notCompleted}</b><span>Not completed</span></div>
        <div className="stat stat--primary">
          <b>{summary.overallPercentage == null ? '–' : `${summary.overallPercentage}%`}</b>
          <span>Estimated overall</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course</th>
              {card.columns.filter((c) => !/^status$/i.test(c)).map((c) => <th key={c}>{c}</th>)}
              <th>Est. %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.perCourse.map(({ course, percentage, basis, belowTermEndPass }) => (
              <tr key={course.code}>
                <td><strong>{course.code}</strong></td>
                {course.components.map((c) => {
                  const failed = classifyComponent(c.label) === 'theory' && belowTermEndPass
                  return (
                    <td key={c.label} className={failed ? 'cell-bad' : c.value == null ? 'cell-empty' : ''}>
                      {c.raw || '-'}
                    </td>
                  )
                })}
                <td title={basis}>{percentage == null ? '–' : `${percentage}%`}</td>
                <td><span className={`badge badge--${STATUS_CLASS[course.status]}`}>{STATUS_LABEL[course.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="notes">
        {PASS_NOTES.map((n) => <li key={n}>{n}</li>)}
        <li>Term-end marks below {TERM_END_PASS_MARK} are highlighted in red. Percentages are estimates, not official results.</li>
        <li>Indicative only, no legal validity. Verify with IGNOU.</li>
      </ul>
    </section>
  )
}
