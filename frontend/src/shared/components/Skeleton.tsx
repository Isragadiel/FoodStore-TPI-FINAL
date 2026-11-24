export function Skeleton() {
  return (
    <div role="status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-xl bg-slate-200"
        />
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  )
}
