"use client"
import React, { useState } from "react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import ExternalLink from "../ExternalLink"

const TERMS = [
  "I understand that Retro Funding grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any Retro Funding rewards that are awarded must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that no member of the team receiving the grant is a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury’s Office of Foreign Assets Control, including but not limited to Cuba, Belarus, the Democratic Republic of Congo, Iran, North Korea, the Russian Federation, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that no member of the team receiving the grant is barred from participating in Optimism’s grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

export function MissionTerms({ onSubmit }: { onSubmit: () => void }) {
  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length + 1 }, () => false),
  )

  const canSubmitForm = agreedTerms.every((term) => term)

  const toggleAgreedTerm = (idx: number) => {
    setAgreedTerms((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }

  return (
    <>
      <p className="text-2xl font-bold mb-5">Agree and apply</p>

      <div className="flex flex-col gap-y-4 ml-px">
        {TERMS.map((term, idx) => (
          <div key={idx} className="flex gap-x-4">
            <Checkbox
              className="mt-1"
              checked={agreedTerms[idx]}
              onCheckedChange={() => toggleAgreedTerm(idx)}
            />
            <p className="text-secondary-foreground">{term}</p>
          </div>
        ))}

        <div className="flex gap-x-4">
          <Checkbox
            className="mt-1"
            checked={agreedTerms[TERMS.length]}
            onCheckedChange={() => toggleAgreedTerm(TERMS.length)}
          />
          <p className="">
            I agree to the{" "}
            <ExternalLink
              href="https://www.optimism.io/data-privacy-policy"
              className="font-medium"
            >
              Optimism Foundation&apos;s Privacy Policy
            </ExternalLink>
            .
          </p>
        </div>
      </div>

      <Button
        className="mt-10"
        variant={"destructive"}
        disabled={!canSubmitForm}
        onClick={onSubmit}
      >
        Submit
      </Button>
    </>
  )
}
