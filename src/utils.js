export const COLORS = ['#0f62fe', '#007d79', '#8a3ffc', '#d02670', '#0072c3', '#6f6f6f']
export const col = i => COLORS[i % COLORS.length]
export const fmt = n => '€' + Math.abs(n).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const initials = name => name.slice(0, 2).toUpperCase()
