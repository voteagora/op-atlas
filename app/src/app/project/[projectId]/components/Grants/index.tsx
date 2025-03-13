import Image from "next/image"

import { formatNumberWithCommas } from "@/lib/utils"

import TotalBanner from "./TotalBanner"

export default function Grants() {
  return (
    <div className="w-full space-y-6">
      <h4>Grants</h4>
      <ul className="space-y-2">
        {GRANTS.map(({ title, type, date, amount }) => (
          <li
            key={`${title} ${type} ${date}`}
            className="px-6 flex items-center space-x-2 justify-between"
          >
            <div className="flex items-center space-x-2">
              {type === "retro-grant" && (
                <Image
                  src="/assets/icons/sunny-black.svg"
                  width={24}
                  height={24}
                  alt={`Retro Grant ${title}`}
                />
              )}
              {type === "op-grant" && (
                <Image
                  src="/assets/icons/shining-black.svg"
                  width={24}
                  height={24}
                  alt={`Optimism Grant ${title}`}
                />
              )}
              <p>
                <span className="font-medium text-foreground">{title}</span>
                <span className="text-secondary-foreground"> · {date}</span>
              </p>
            </div>
            <span className="font-medium">
              {formatNumberWithCommas(amount)} OP
            </span>
          </li>
        ))}
        <li className="pt-2">
          <hr className="w-full" />
          <div className="w-full flex items-center justify-between space-x-2 pt-4 text-foreground font-medium px-6">
            <span>Total</span>
            <span>
              {formatNumberWithCommas(
                GRANTS.map((grant) => grant.amount).reduce((x, y) => x + y, 0),
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

// TODO: Replace this with actual data
const GRANTS = [
  {
    type: "retro-grant",
    title: "Retro Funding Mission: Onchain Builders",
    date: "Feb 12 - July 30, 2025",
    amount: 1_580,
  },
  {
    type: "op-grant",
    title: "Optimism Grant: Token House Mission",
    date: "Oct 2024",
    amount: 34_000,
  },
  {
    type: "retro-grant",
    title: "Retro Funding 4: Onchain Builders",
    date: "May 2024",
    amount: 426_708,
  },
  {
    type: "retro-grant",
    title: "Retro Funding 3",
    date: "Oct 2023",
    amount: 100_000,
  },
]
//
