import { format, parseISO } from 'date-fns'

export function formatDate(timestamp) {
  if (!timestamp) return '-'

  const date = timestamp instanceof Date ? timestamp : parseISO(String(timestamp))
  return format(date, 'dd MMM yyyy, h:mma').replace('AM', 'am').replace('PM', 'pm')
}
