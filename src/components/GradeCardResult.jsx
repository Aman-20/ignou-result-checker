import { useMemo, useRef } from 'react'
import ExportButtons from './ExportButtons'
import { summariseGradeCard, TERM_END_PASS_MARK, COMPONENT_PASS_MARK, classifyComponent } from '../utils/calc'
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
            Enrolment {card.enrolmentNo} · {card.programmeCode}
            {card.asOn && <> · as on {card.asOn}</>}
          </p>
        </div>
        <ExportButtons targetRef={ref} filename={safeFilename(`gradecard_${card.enrolmentNo}`)} />
      </div>

      {card.studentName && (
        <div className="student">
          <span className="student__label">Student name</span>
          <strong className="student__name">{card.studentName}</strong>
        </div>
      )}

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
                <td className="cell-title" data-label="Course"><strong>{course.code}</strong></td>
                {course.components.map((c) => {
                  const kind = classifyComponent(c.label)
                  const failed = kind === 'theory' && belowTermEndPass
                  const low = !failed && kind !== 'theory' && c.value != null && c.value < COMPONENT_PASS_MARK
                  const cls = failed ? 'cell-bad' : low ? 'cell-warn' : c.value == null ? 'cell-empty' : ''
                  return (
                    <td key={c.label} className={cls} data-label={c.label}>
                      {c.raw || '-'}
                    </td>
                  )
                })}
                <td data-label="Est. %" title={basis}>{percentage == null ? '–' : `${percentage}%`}</td>
                <td data-label="Status"><span className={`badge badge--${STATUS_CLASS[course.status]}`}>{STATUS_LABEL[course.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="notes">
        {PASS_NOTES.map((n) => <li key={n}>{n}</li>)}
        <li>Term-end theory marks below {TERM_END_PASS_MARK} are highlighted in red (fail). Percentages are estimates, not official results.</li>
      </ul>
    </section>
  )
}
