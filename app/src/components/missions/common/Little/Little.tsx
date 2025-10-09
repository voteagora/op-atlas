export function Little({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col">
      <p className="font-normal">{title}</p>
      <p className="font-light text-sm">{description}</p>
    </div>
  )
}
