"use client"

import { memo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { DialogProps } from "./types"

const TIME_COMMITMENT_OPTIONS = [
    "Less than 1 hour",
    "1-5 hours",
    "5-10 hours",
    "10-20 hours",
    "More than 20 hours",
] as const

type TimeCommitment = (typeof TIME_COMMITMENT_OPTIONS)[number]

function CitizenshipGovernanceCommitmentDialog({
    open,
    onOpenChange,
}: DialogProps<object>) {
    const [selectedTime, setSelectedTime] = useState<TimeCommitment | undefined>()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
                <div className="flex flex-col gap-4 w-full">
                    <div className="font-semibold text-center">
                        How many hours per week would you like to spend on governance?
                    </div>
                    <Select
                        value={selectedTime}
                        onValueChange={(value: TimeCommitment) => setSelectedTime(value)}
                    >
                        <SelectTrigger className="w-full" >
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
                        onClick={() => { }}
                        className="button-primary"
                        disabled={!selectedTime}
                    >
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default memo(CitizenshipGovernanceCommitmentDialog)
