import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export async function exportExcel(data, filename, sheetName = 'Report') {
  const rows = Array.isArray(data) ? data : []
  if (!rows.length) return

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.max(14, String(header).length + 6),
  }))

  rows.forEach((row) => {
    worksheet.addRow(row)
  })

  const buffer = await workbook.xlsx.writeBuffer()

  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, finalName)
}
