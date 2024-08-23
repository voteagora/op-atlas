import { format } from "date-fns"
import { Copy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProjectWithDetails } from "@/lib/types"
import { copyToClipboard, numberWithCommas } from "@/lib/utils"

const RewardAccordion = ({
  reward,
  team,
}: {
  reward: ProjectWithDetails["rewards"][0]
  team: ProjectWithDetails["team"]
}) => {
  const [isExpanded, setIsExpanded] = React.useState("")

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying URL")
    }
  }

  return (
    <Accordion
      type="single"
      value={isExpanded}
      onValueChange={setIsExpanded}
      collapsible
      className="w-full border border-default rounded-xl p-8"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="justify-between p-0">
          <div className="flex items-center text-base font-semibold gap-1 flex-1">
            Retro Funding Round {reward.id}
          </div>
          {!isExpanded && (
            <div className="flex gap-2">
              <Image
                src="/assets/chain-logos/optimism.png"
                height={20}
                width={20}
                alt="Optimism"
              />
              <div className="text-sm text-secondary-foreground">
                {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
                {numberWithCommas(reward.amount)}
              </div>
            </div>
          )}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-2">
            <div className="font-medium text-sm">Grant amount</div>
            <div className="border border-border rounded-lg flex px-3 py-[10px] gap-2 items-center">
              <Image
                src="/assets/chain-logos/optimism.png"
                height={20}
                width={20}
                alt="Optimism"
              />
              <div className="text-sm text-secondary-foreground">
                {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
                {numberWithCommas(reward.amount)}
              </div>
            </div>
          </div>

          {reward.claim ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="font-medium text-sm text-foreground">
                  Wallet address
                </div>
                <div className="border border-border rounded-lg flex px-3 py-[10px] gap-2 items-center">
                  <Image
                    src="/assets/icons/tickIcon.svg"
                    width={16}
                    height={16}
                    alt="Check"
                  />
                  <div className="text-sm text-foreground">
                    {reward.claim.address}
                  </div>
                  <Button
                    onClick={() =>
                      handleCopyAddress(reward.claim?.address ?? "")
                    }
                    variant="ghost"
                    className="p-0 h-fit"
                  >
                    <Copy
                      className="rotate-90 text-muted cursor-pointer"
                      size={16}
                    />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-foreground">
                <div className="font-medium text-sm">Verified individuals</div>
                {team.map((user) => (
                  <div
                    key={user.id}
                    className="border border-border rounded-lg flex h-10 px-3 py-[10px] gap-2 items-center"
                  >
                    <Avatar className="!w-6 !h-6">
                      <AvatarImage
                        src={user.user.imageUrl || ""}
                        alt="team avatar"
                      />
                      <AvatarFallback>{user.user.username} </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">{user.user.username}</div>
                  </div>
                ))}
              </div>

              {reward.claim.tokenStreamClaimableAt && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-medium text-sm text-foreground">
                    Token stream
                  </div>
                  <div className="flex items-center gap-x-1.5">
                    <div className="border border-border rounded-lg w-full flex px-3 py-[10px] gap-2 items-center">
                      <Image
                        src="/assets/icons/tickIcon.svg"
                        width={16}
                        height={16}
                        alt="Check"
                      />
                      <div className="text-sm text-foreground">
                        Completed on{" "}
                        {format(
                          reward.claim?.tokenStreamClaimableAt,
                          "MMMM d, yyyy 'at' h:mm a",
                        )}
                      </div>
                    </div>
                    <Link href="/">
                      <Button variant="secondary">View</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/rewards/${reward.id}`}>
              <Button variant="destructive">Claim</Button>
            </Link>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default RewardAccordion
