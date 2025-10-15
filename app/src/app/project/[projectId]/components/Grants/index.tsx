import { ProjectFunding } from "@prisma/client"
import Image from "next/image"

import { formatNumber } from "@/lib/utils"

import TotalBanner from "./TotalBanner"

interface GrantsProps {
  funding?: ProjectFunding[]
}

export default function Grants({ funding }: GrantsProps) {
  if (!funding?.length) {
    return null
  }

  return (
    <div className="w-full space-y-6">
      <h4>Grants</h4>
      <ul className="space-y-2">
        {funding.map(({ grant, type, createdAt, amount }) => {
          const formattedDate = new Date(createdAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
            },
          )
          return (
            <li
              key={`${grant} ${type} ${formattedDate}`}
              className="px-6 flex items-center space-x-2 justify-between"
            >
              <div className="flex items-center space-x-2">
                {type === "retro-grant" && (
                  <Image
                    src="/assets/icons/sunny-black.svg"
                    width={24}
                    height={24}
                    alt={`Retro Grant ${grant}`}
                  />
                )}
                {type === "op-grant" && (
                  <Image
                    src="/assets/icons/shining-black.svg"
                    width={24}
                    height={24}
                    alt={`Optimism Grant ${grant}`}
                  />
                )}
                <p>
                  <span className="font-normal text-foreground">{grant}</span>
                  <span className="text-secondary-foreground">
                    {" "}
                    · {formattedDate}
                  </span>
                </p>
              </div>
              <span className="font-normal">{formatNumber(amount, 0)} OP</span>
            </li>
          )
        })}
        <li className="pt-2">
          <hr className="w-full" />
          <div className="w-full flex items-center justify-between space-x-2 pt-4 text-foreground font-normal px-6">
            <span>Total</span>
            <span>
              {formatNumber(
                funding
                  .map((grant) => Number(grant.amount))
                  .reduce((x, y) => x + y, 0),
                0,
              )}{" "}
              OP
            </span>
          </div>
        </li>
      </ul>
      <TotalBanner />
    </div>
  )
}
