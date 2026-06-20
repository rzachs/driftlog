module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      colors: {
        driftlog: {
          panel: '#161616',
          blue: '#0f62fe',
          'blue-hover': '#0050e6',
          'blue-active': '#002d9c',
          'blue-accent': '#4589ff',
          field: '#f4f4f4',
          'field-hover': '#e8e8e8',
          'border-subtle': '#c6c6c6',
          'border-strong': '#8d8d8d',
          'gray-30': '#c6c6c6',
          'gray-40': '#a8a8a8',
          'gray-50': '#8d8d8d',
          'gray-80': '#393939',
          'text-2': '#525252',
          'text-helper': '#6f6f6f',
        }
      }
    }
  }
}
