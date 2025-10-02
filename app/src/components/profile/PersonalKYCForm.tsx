"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createUserKYC } from "@/lib/actions/userKyc"

export default function PersonalKYCForm() {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(formData.email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fill in all required fields with valid information")
      return
    }

    startTransition(async () => {
      try {
        const result = await createUserKYC({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        })

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success) {
          toast.success(result.message || "KYC verification started successfully!")
          // The page will automatically revalidate and show the status component
        }
      } catch (error) {
        console.error("Error starting KYC:", error)
        toast.error("Failed to start verification. Please try again.")
      }
    })
  }

  const isFormValid = validateForm()

  return (
    <div className="flex flex-col gap-6">
      <div className="text-secondary-foreground">
        Provide your information to begin the KYC process. We&apos;ll send you a secure verification link via email.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="first-name" className="block text-sm font-medium mb-2">
            First name<span className="text-destructive">*</span>
          </label>
          <Input
            id="first-name"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Jane"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="last-name" className="block text-sm font-medium mb-2">
            Last name<span className="text-destructive">*</span>
          </label>
          <Input
            id="last-name"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Doe"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email<span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="name@example.com"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="business-name" className="block text-sm font-medium mb-2">
            Business Name
          </label>
          <Input
            id="business-name"
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            placeholder="Acme Co."
            disabled={isPending}
          />
        </div>

        <div className="flex justify-start pt-4">
          <Button
            type="submit"
            variant="destructive"
            disabled={!isFormValid || isPending}
            isLoading={isPending}
            size="lg"
          >
            {isPending ? "Starting Verification..." : "Start KYC Verification"}
          </Button>
        </div>
      </form>
    </div>
  )
}