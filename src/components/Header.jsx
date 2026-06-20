import { Link } from 'react-router-dom'

export default function Header({ subtitle = 'Trips' }) {
  return (
    <header className="h-12 bg-driftlog-panel text-white flex items-center px-4 sticky top-0 z-10">
      <div className="flex items-center gap-[10px]">
        <div className="w-5 h-5 bg-driftlog-blue-accent flex items-center justify-center">
          <span className="font-semibold text-[0.8125rem] leading-none">$</span>
        </div>
        <Link to="/trips" className="text-sm no-underline text-white">
          <span className="font-semibold">Driftlog</span>{' '}
          <span className="text-driftlog-gray-40">{subtitle}</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center h-full">
        <button aria-label="Settings" className="w-12 h-12 border-0 bg-transparent cursor-pointer flex items-center justify-center hover:bg-[#2e2e2e]">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="white">
            <path d="M27 16.76V15.24l1.92-3.23-4.03-6.96-3.6 1.33-1.3-.75-.46-3.63H13.5l-.45 3.63-1.3.75-3.61-1.33L4.1 12l1.91 3.22V16.76L4.1 20l4.03 6.96 3.61-1.33 1.3.75.45 3.62H18.5l.46-3.62 1.3-.75 3.6 1.33L27.9 20zm-2.34 2.93-1.58 2.74-3.23-1.2-2.2 1.27-.41 3.25h-3.17l-.4-3.25-2.2-1.27-3.22 1.2L7.3 19.7l1.73-2.92v-1.56L7.3 12.3l1.62-2.77 3.22 1.2 2.2-1.27.4-3.26h3.17l.41 3.26 2.2 1.27 3.23-1.2 1.58 2.74-1.73 2.94v1.55z"/>
            <path d="M16 20a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-driftlog-blue text-white flex items-center justify-center text-xs font-semibold ml-2">YO</div>
      </div>
    </header>
  )
}
