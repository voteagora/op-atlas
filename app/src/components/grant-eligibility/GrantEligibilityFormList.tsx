"use client"

import { ChevronDownIcon, ChevronUpIcon, CalendarIcon, FileTextIcon, WalletIcon } from "lucide-react"
import React, { useState } from "react"
import { format } from "date-fns"
import type { GrantEligibility, GrantType } from "@prisma/client"

import { cn } from "@/lib/utils"

interface FormListProps {
  title: string
  forms: GrantEligibility[]
  variant?: "expired" | "submitted"
  defaultOpen?: boolean
}

function formatGrantType(type: GrantType | null) {
  if (!type) return "Not specified"
  
  const labels: Record<GrantType, string> = {
    RETRO_FUNDING: "Retro Funding",
    AUDIT_GRANT: "Audit Grant",
    GROWTH_GRANT: "Growth Grant",
    FOUNDATION_MISSION: "Foundation Mission",
  }
  
  return labels[type] || type
}

export function GrantEligibilityFormList({ title, forms, variant, defaultOpen = false }: FormListProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (forms.length === 0) {
    return null
  }

  return (
    <div className="border rounded-lg">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{title}</span>
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full",
            variant === "expired" 
              ? "bg-orange-100 text-orange-600" 
              : "bg-green-100 text-green-600"
          )}>
            {forms.length}
          </span>
        </div>
        {isOpen ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
      </button>

      {isOpen && (
        <div className="border-t">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-medium">Grant Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Wallet Address</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {variant === "expired" ? "Expired At" : "Submitted At"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileTextIcon size={16} className="text-muted-foreground" />
                        <span className="text-sm">{formatGrantType(form.grantType)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <WalletIcon size={16} className="text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {form.walletAddress ? 
                            `${form.walletAddress.slice(0, 6)}...${form.walletAddress.slice(-4)}` 
                            : "Not provided"
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-muted-foreground" />
                        <span className="text-sm">
                          {variant === "expired" && form.expiresAt
                            ? format(new Date(form.expiresAt), "MMM d, yyyy")
                            : variant === "submitted" && form.submittedAt
                            ? format(new Date(form.submittedAt), "MMM d, yyyy")
                            : "-"
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(form.createdAt), "MMM d, yyyy")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}