export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <div className="mt-4 bg-background flex flex-col px-6 py-8 lg:px-0 w-full max-w-4xl gap-6">
        {children}
      </div>
    </main>
  )
}

