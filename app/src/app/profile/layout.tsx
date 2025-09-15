import { PropsWithChildren, Suspense } from "react"

import { ProfileSidebar } from "./ProfileSidebar"

export default function Layout({ children }: PropsWithChildren<object>) {
  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <Suspense
          fallback={<div className="hidden sm:flex flex-col w-[228px]" />}
        >
          <ProfileSidebar />
        </Suspense>
        <div className="card flex-1 w-full max-w-[840px]">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
