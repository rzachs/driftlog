module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      colors: {
        panel:         '#161616',
        brand:         '#0f62fe',
        'brand-hover': '#0050e6',
        'brand-active':'#002d9c',
        'brand-accent':'#4589ff',
        field:         '#f4f4f4',
        'field-hover': '#e8e8e8',
        subtle:        '#c6c6c6',
        strong:        '#8d8d8d',
        row:           '#e0e0e0',
        'gray-30':     '#c6c6c6',
        'gray-40':     '#a8a8a8',
        'gray-50':     '#8d8d8d',
        'gray-80':     '#393939',
        muted:         '#525252',
        helper:        '#6f6f6f',
        success:       '#24a148',
        'success-bg':  '#defbe6',
        danger:        '#da1e28',
        'danger-bg':   '#fff1f1',
        badge:         '#0043ce',
        'badge-bg':    '#d0e2ff',
      }
    }
  }
}
