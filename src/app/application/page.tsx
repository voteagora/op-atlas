import { Application } from "@/components/application"

export default function Page() {
  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pt-18 pb-12">
      <Application className="mt-18 max-w-4xl" projects={[]} />
    </main>
  )
}
