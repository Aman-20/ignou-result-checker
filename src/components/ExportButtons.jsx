import { useState } from 'react'
import { exportAsImage, exportAsPdf } from '../utils/exportUtils'

// Rendered inside the card it exports; data-html2canvas-ignore keeps it out of the file.
export default function ExportButtons({ targetRef, filename }) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const run = async (kind) => {
    if (!targetRef.current) return
    setBusy(kind)
    setError('')
    try {
      await (kind === 'png' ? exportAsImage : exportAsPdf)(targetRef.current, filename)
    } catch {
      setError('Export failed. Please try again.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="export-buttons" data-html2canvas-ignore="true">
      <button type="button" onClick={() => run('png')} disabled={!!busy}>
        {busy === 'png' ? 'Preparing…' : 'Download image'}
      </button>
      <button type="button" onClick={() => run('pdf')} disabled={!!busy}>
        {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
      </button>
      {error && <span className="export-buttons__error">{error}</span>}
    </div>
  )
}
