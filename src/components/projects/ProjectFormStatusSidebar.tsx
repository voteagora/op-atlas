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
  "Addresses",
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
    <div>
      <Button
        onClick={handleGoBack}
        variant="outline"
        className="bg-white text-sm font-medium"
      >
        Profile
      </Button>
      <h2 className="text-muted mt-6 ">Project 1</h2>
      <Progress value={progress} className="w-[228px] h-2 mt-6" />
      <p className="mt-2 text-sm font-normal">{progress}% complete</p>

      <div className="mt-6">
        {ProjectFormStatusSidebarOptions.map((option, index) => (
          <div
            key={index}
            className="flex justify-start items-start flex-row gap-x-2 py-2"
          >
            <div className=" w-4">
              {index === 0 || index === 1 ? (
                <Image
                  src="/assets/icons/tickIcon.svg"
                  width={20}
                  height={20}
                  alt="img"
                  className="mt-2"
                />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted mt-2"></div>
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
