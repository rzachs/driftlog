import Header from './Header'

export default function PageShell({ children, maxWidth = '768px', subtitle }) {
  return (
    <div className="font-sans bg-white text-panel min-h-screen">
      <Header subtitle={subtitle} />
      <main className="mx-auto px-4 pt-8 pb-20" style={{ maxWidth }}>
        {children}
      </main>
    </div>
  )
}
