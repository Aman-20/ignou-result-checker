// Image / PDF export. Libraries are loaded on demand so they don't slow the first page load.
// Elements (or ancestors) with the attribute data-html2canvas-ignore are left out of the export.

async function renderToCanvas(node, scale = 2) {
  const { default: html2canvas } = await import('html2canvas')
  return html2canvas(node, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    // Lay the card out at desktop width so wide tables are exported in full, even from a phone.
    windowWidth: Math.max(node.scrollWidth, node.clientWidth, 1000),
    onclone: (doc) => {
      doc.querySelectorAll('.table-wrap').forEach((el) => { el.style.overflow = 'visible' })
    },
  })
}

function download(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export async function exportAsImage(node, filename) {
  const canvas = await renderToCanvas(node)
  download(canvas.toDataURL('image/png'), `${filename}.png`)
}

export async function exportAsPdf(node, filename) {
  // 1.5x is plenty sharp for a PDF and keeps the file small.
  const canvas = await renderToCanvas(node, 1.5)
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 10
  const imgW = pageW - margin * 2
  const pxPerMm = canvas.width / imgW
  const sliceHpx = Math.floor((pageH - margin * 2) * pxPerMm)

  // Slice the tall canvas into A4-sized pages. Pages are stored as compressed JPEG:
  // PNG pages are stored uncompressed by jsPDF and make the file very large.
  for (let y = 0, page = 0; y < canvas.height; y += sliceHpx, page++) {
    const h = Math.min(sliceHpx, canvas.height - y)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = h
    const ctx = slice.getContext('2d')
    ctx.fillStyle = '#ffffff' // JPEG has no transparency
    ctx.fillRect(0, 0, slice.width, h)
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
    if (page > 0) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/jpeg', 0.82), 'JPEG', margin, margin, imgW, h / pxPerMm, undefined, 'FAST')
  }

  pdf.save(`${filename}.pdf`)
}

export const safeFilename = (s) => s.replace(/[^a-z0-9_-]+/gi, '_')
