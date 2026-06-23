export default function CalloutBanner({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between gap-6 mt-8 p-6 bg-field border-l-[3px] border-brand">
      <div>
        <p className="mb-1 text-base font-semibold">{title}</p>
        <p className="m-0 text-sm text-muted">{sub}</p>
      </div>
      {action}
    </div>
  )
}
