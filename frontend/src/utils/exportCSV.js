export function exportCSV(data, filename) {
  const rows = Array.isArray(data) ? data : []
  if (!rows.length) return

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const escapeCell = (value) => {
    const cell = value == null ? '' : String(value)
    return `"${cell.replaceAll('"', '""')}"`
  }

  const csv = [headers.join(',')]
    .concat(rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')))
    .join('\n')

  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
