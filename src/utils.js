export const COLORS = ['#0f62fe', '#007d79', '#8a3ffc', '#d02670', '#0072c3', '#6f6f6f']
export const col = i => COLORS[i % COLORS.length]
export const fmt = n => '€' + Math.abs(n).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDateRange = (s, e) => {
  if (!s && !e) return '—'
  return s && e ? fmtDate(s) + ' – ' + fmtDate(e) : fmtDate(s || e)
}
export const fmtBal = n => (n >= 0 ? '+' : '−') + fmt(n)
export const initials = name => {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}
