"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const ProjectFormStatusSidebarOptions = [
  "Details",
  "Team",
  "Repos",
  "Contracts",
  "Grants",
]

const ProjectFormStatusSidebar = () => {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(20), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  return (
    <div className="sm:flex flex-col gap-6 items-start hidden">
      <Button
        onClick={handleGoBack}
        variant="outline"
        className="bg-white text-sm font-medium"
      >
        Profile
      </Button>
      <h2 className="text-muted">Project 1</h2>
      <div className="flex flex-col gap-2">
        <Progress value={progress} className="w-[228px] h-2" />
        <p className="text-sm font-normal">{progress}% complete</p>
      </div>

      <div className="gap-2">
        {ProjectFormStatusSidebarOptions.map((option, index) => (
          <div
            key={index}
            className="flex justify-start items-center flex-row gap-2 py-2"
          >
            <div className="w-4 flex justify-center">
              {index === 0 || index === 1 ? (
                <Image
                  src="/assets/icons/tickIcon.svg"
                  width={20}
                  height={20}
                  alt="Check"
                />
              ) : (
                <Image
                  src="/assets/icons/circle-fill.svg"
                  width={6.67}
                  height={6.67}
                  alt="Dot"
                />
              )}
            </div>

            <p>{option}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectFormStatusSidebar
