import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import SearchForm from './components/SearchForm'
import GradeCardResult from './components/GradeCardResult'
import AssignmentResult from './components/AssignmentResult'
import { fetchAssignmentStatus, fetchGradeCard, fetchProgrammes } from './services/ignouApi'
import { FALLBACK_PROGRAMMES } from './config/siteInfo'
import './App.css'

const errorText = (err) => err?.message || 'Something went wrong. Please try again.'

export default function App() {
  const [programmes, setProgrammes] = useState(FALLBACK_PROGRAMMES)
  const [loading, setLoading] = useState(false)
  // Each slot: { state: 'ok' | 'empty' | 'error', data?, message? }
  const [grade, setGrade] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [tab, setTab] = useState('grade')

  // Try to load IGNOU's full programme list for the suggestions; fall back silently.
  useEffect(() => {
    let alive = true
    fetchProgrammes()
      .then((list) => alive && list.length && setProgrammes(list))
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const handleSubmit = async ({ enrolment, programme, wantGrade, wantAssignment }) => {
    setLoading(true)
    setGrade(null)
    setAssignment(null)
    setTab(wantGrade ? 'grade' : 'assignment')

    const run = async (want, task, setter, emptyMsg) => {
      if (!want) return
      try {
        const data = await task()
        setter(data ? { state: 'ok', data } : { state: 'empty', message: emptyMsg })
      } catch (err) {
        setter({ state: 'error', message: errorText(err) })
      }
    }

    await Promise.all([
      run(
        wantGrade,
        () => fetchGradeCard(enrolment, programme),
        setGrade,
        'No grade card record found. Check the enrolment number and programme code.',
      ),
      run(
        wantAssignment,
        async () => {
          const res = await fetchAssignmentStatus(enrolment, programme)
          return res.found ? res : null
        },
        setAssignment,
        'No assignment/practical submission found. This can mean a wrong enrolment number, a wrong programme, or nothing submitted yet. Check with your Study Centre if you have submitted.',
      ),
    ])
    setLoading(false)
  }

  const slots = [
    { key: 'grade', label: 'Grade card', slot: grade },
    { key: 'assignment', label: 'Assignments', slot: assignment },
  ].filter((s) => s.slot)

  const renderSlot = ({ key, slot }) => {
    if (slot.state === 'error') return <p className="notice notice--bad">{slot.message}</p>
    if (slot.state === 'empty') return <p className="notice">{slot.message}</p>
    return key === 'grade' ? <GradeCardResult card={slot.data} /> : <AssignmentResult status={slot.data} />
  }

  const active = slots.find((s) => s.key === tab) || slots[0]

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <SearchForm programmes={programmes} loading={loading} onSubmit={handleSubmit} />

        {slots.length > 1 && (
          <div className="tabs" role="tablist">
            {slots.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={active?.key === s.key}
                className={active?.key === s.key ? 'tab tab--active' : 'tab'}
                onClick={() => setTab(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {active && <div className="app__result">{renderSlot(active)}</div>}
      </main>
      <Footer />
    </div>
  )
}
