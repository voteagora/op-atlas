"use client"

import { memo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import { useCitizenAttest } from "@/hooks/citizen/useCitizenAttest"
import { useSession } from "next-auth/react"
import { DialogProps } from "./types"

const RULES = [
    "I will not attempt to get multiple votes in the Citizens House.",
    "I understand that the eligibility criteria of the Citizens House may change next season and I could no longer be a Citizen.",
    "I will abide by the rules of engagement",
] as const

function CitizenshipRulesDialog({
    open,
    onOpenChange,
}: DialogProps<object>) {

    const { data: session } = useSession()
    const userId = session?.user?.id ?? ""

    const { attestCitizen, isLoading } = useCitizenAttest(userId)

    const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({})

    const handleCheckboxChange = (index: number) => {
        setCheckedRules(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const allRulesChecked = RULES.every((_, index) => checkedRules[index])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex sm:max-w-md">
                <div className="flex flex-col gap-6 w-full">
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
                                <div className="text-sm text-muted-foreground">{rule}</div>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={() => attestCitizen()}
                        className="button-primary w-full"
                        disabled={!allRulesChecked || isLoading}

                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default memo(CitizenshipRulesDialog) 