import { useState } from 'react'
import './SearchForm.css'

const ENROLMENT_RE = /^[A-Z0-9]{9,10}$/

export default function SearchForm({ programmes, loading, onSubmit }) {
  const [enrolment, setEnrolment] = useState('')
  const [programme, setProgramme] = useState('')
  const [wantGrade, setWantGrade] = useState(true)
  const [wantAssignment, setWantAssignment] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const eno = enrolment.trim().toUpperCase()
    const typed = programme.trim()
    // Use IGNOU's own spelling if it matches a known code, otherwise what was typed.
    const known = programmes.find((p) => p.code.toLowerCase() === typed.toLowerCase())
    const prog = known ? known.code : typed.toUpperCase()

    if (!ENROLMENT_RE.test(eno)) return setError('Enrolment number must be 9 or 10 letters/digits.')
    if (!prog) return setError('Please enter or choose your programme code, for example BCA_NEW.')
    if (!wantGrade && !wantAssignment) return setError('Choose at least one thing to check.')

    setError('')
    onSubmit({ enrolment: eno, programme: prog, wantGrade, wantAssignment })
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <div className="search-form__fields">
        <label>
          <span>Enrolment number</span>
          <input
            value={enrolment}
            onChange={(e) => setEnrolment(e.target.value)}
            placeholder="e.g. 2000000001"
            maxLength={10}
            autoComplete="off"
            inputMode="text"
          />
        </label>

        <label>
          <span>Programme code</span>
          <input
            list="programme-list"
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            placeholder="e.g. BCA_NEW"
            autoComplete="off"
          />
          <datalist id="programme-list">
            {programmes.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </datalist>
        </label>
      </div>

      <fieldset className="search-form__choices">
        <legend>What do you want to check?</legend>
        <label className="chip">
          <input type="checkbox" checked={wantGrade} onChange={(e) => setWantGrade(e.target.checked)} />
          Grade card status
        </label>
        <label className="chip">
          <input type="checkbox" checked={wantAssignment} onChange={(e) => setWantAssignment(e.target.checked)} />
          Assignment / practical status
        </label>
      </fieldset>

      {error && <p className="search-form__error" role="alert">{error}</p>}

      <button className="search-form__submit" type="submit" disabled={loading}>
        {loading ? 'Checking IGNOU… this can take up to 30 seconds' : 'Check status'}
      </button>
    </form>
  )
}
