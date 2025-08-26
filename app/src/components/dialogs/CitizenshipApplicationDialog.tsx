"use client"

import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { memo, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCitizen } from "@/hooks/citizen/useCitizen"
import { useCitizenAttest } from "@/hooks/citizen/useCitizenAttest"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { useCitizenUpdate } from "@/hooks/citizen/useCitizenUpdate"
import { useUser } from "@/hooks/db/useUser"
import { CITIZEN_TYPES } from "@/lib/constants"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { CheckboxCircleFIll } from "../icons/remix"
import { DialogProps } from "./types"

const TIME_COMMITMENT_OPTIONS = [
  "Less than 1 hour",
  "1-5 hours",
  "5-10 hours",
  "10-20 hours",
  "More than 20 hours",
] as const

type TimeCommitment = (typeof TIME_COMMITMENT_OPTIONS)[number]

const RULES = [
  "I will not attempt to get multiple votes in the Citizens House.",
  "I understand that the eligibility criteria of the Citizens House may change next season and I could no longer be a Citizen.",
  'I will abide by the <a href="https://gov.optimism.io/t/code-of-conduct/5751" target="_blank" style="text-decoration: underline;">Code of Conduct</a>.',
] as const

function CitizenshipApplicationDialog({
  open,
  onOpenChange,
  redirectUrl,
}: DialogProps<object> & { redirectUrl?: string }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ""

  const { data: citizen } = useCitizen({
    query: { type: CITIZEN_TYPES.user, id: userId },
  })

  const {
    attestCitizen,
    isLoading: isAttesting,
    isSuccess: isAttestSuccess,
  } = useCitizenAttest(userId, redirectUrl)

  const {
    updateCitizen,
    isLoading: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useCitizenUpdate(userId)

  const { track } = useAnalytics()

  const { data: qualification, isLoading: isQualificationLoading } =
    useCitizenQualification(userId)
  const { user } = useUser({ id: userId })

  const [selectedTime, setSelectedTime] = useState<TimeCommitment | undefined>(
    citizen?.timeCommitment as TimeCommitment,
  )
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({})

  const handleCheckboxChange = (index: number) => {
    setCheckedRules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const allRulesChecked = RULES.every((_, index) => checkedRules[index])

  const handleTimeCommitmentUpdate = async () => {
    if (!qualification?.type) {
      return
    }

    updateCitizen({
      address: user?.addresses[0].address as string,
      timeCommitment: selectedTime,
      type: qualification.type,
    })
  }

  // Reset selected time when dialog opens and citizen has no time commitment
  useEffect(() => {
    if (open && !citizen?.timeCommitment) {
      setSelectedTime(undefined)
    }
  }, [open, citizen?.timeCommitment])

  useEffect(() => {
    if (isAttestSuccess) {
      track("Registration Success", {
        user_group: qualification?.type,
        wallet_address: user?.addresses[0].address as string,
        elementType: "EAS Response",
        elementName: "Attestation Success",
      })
    }
  }, [qualification, isAttestSuccess])

  if (isQualificationLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex sm:max-w-md">
          <DialogTitle className="sr-only">Citizenship Application</DialogTitle>
          <div className="flex flex-col gap-4 min-h-[175px] justify-center items-center w-full">
            <Loader2 className="animate-spin mx-auto text-foreground-muted w-6 h-6" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex sm:max-w-md">
        <DialogTitle className="sr-only">Citizenship Application</DialogTitle>
        <div className="flex flex-col gap-6 w-full">
          {!citizen?.timeCommitment &&
          qualification?.type === CITIZEN_TYPES.user ? (
            <>
              <div className="font-semibold text-center">
                How many hours per week would you like to spend on governance?
              </div>
              <Select
                value={selectedTime}
                onValueChange={(value: TimeCommitment) =>
                  setSelectedTime(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your time commitment" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_COMMITMENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleTimeCommitmentUpdate}
                className="button-primary w-full"
                disabled={!selectedTime || isUpdating || isUpdateSuccess}
              >
                {isUpdating || isUpdateSuccess ? "Updating..." : "Update"}
              </Button>
            </>
          ) : (
            <div>
              {isAttesting && !isAttestSuccess && (
                <div className="flex flex-col gap-4 min-h-[150px] justify-center">
                  <div className="text-lg font-semibold text-center">
                    Issuing citizen badge
                  </div>
                  <div className="text-muted-foreground text-center">
                    Optimism is publishing an attestation on your behalf. Please
                    don&apos;t close this window.
                  </div>
                  <Loader2 className="animate-spin mx-auto text-foreground-muted w-6 h-6" />
                </div>
              )}

              {!isAttesting && isAttestSuccess && (
                <div className="flex flex-col gap-4 min-h-[150px] justify-center items-center">
                  <div className="text-lg font-semibold">
                    Citizen badge issued
                  </div>
                  <div className="text-muted-foreground">
                    You are ready to vote!
                  </div>
                  <CheckboxCircleFIll className="w-6 h-6" fill="#FF0000" />
                </div>
              )}

              {!isAttesting && !isAttestSuccess && (
                <div className="flex flex-col gap-5">
                  <div className="font-semibold text-center">
                    Please agree to the Citizens&apos; House rules
                  </div>
                  <div className="flex flex-col gap-4">
                    {RULES.map((rule, index) => (
                      <div key={index} className="flex flex-row gap-2">
                        <Checkbox
                          className="self-start mt-0.5"
                          id={`rule-${index}`}
                          checked={checkedRules[index] || false}
                          onCheckedChange={() => handleCheckboxChange(index)}
                        />
                        <div className="text-sm text-muted-foreground">
                          <div dangerouslySetInnerHTML={{ __html: rule }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={attestCitizen}
                    className="button-primary w-full"
                    disabled={
                      !allRulesChecked ||
                      !user?.addresses[0]?.address ||
                      isAttesting ||
                      isAttestSuccess
                    }
                  >
                    Submit
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(CitizenshipApplicationDialog)
