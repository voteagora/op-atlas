import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"
import React from "react"

interface CardImageProps {
  src: string
  alt: string
}

const CardImage = ({ src, alt }: CardImageProps) => {
  return (
    <div className="flex justify-center">
      <img src={src} alt={alt} />
    </div>
  )
}

interface CardTextProps {
  title: string
  descriptionElement?: string | React.ReactElement
}

const CardText = ({ title, descriptionElement }: CardTextProps) => {
  const cardDescriptionTextStyling =
    "font-inter font-normal text-sm leading-5 tracking-[0%] text-center [&_a]:underline [&_a]:decoration-solid [&_a]:underline-offset-[0%] [&_a]:decoration-[0%]"
  return (
    <div className="text-center">
      <h4 className="text-h4">{title}</h4>
      {descriptionElement ? (
        React.isValidElement(descriptionElement) ? (
          React.cloneElement(
            descriptionElement as React.ReactElement<{ className?: string }>,
            {
              className: cardDescriptionTextStyling,
            },
          )
        ) : (
          <p className={cardDescriptionTextStyling}>{descriptionElement}</p>
        )
      ) : null}
    </div>
  )
}

export interface VotingCardProps {
  cardText: CardTextProps
  cardActions?: CardActionsProps
  cardImage?: CardImageProps
}

const VotingCard = ({ cardText, cardActions, cardImage }: VotingCardProps) => {
  return (
    <div className="rounded-t-lg border-l border-r border-t border-solid p-6 flex flex-col items-center">
      {cardImage && <CardImage {...cardImage} />}
      <CardText {...cardText} />
      {cardActions && <VotingActions {...cardActions} />}
    </div>
  )
}

export default VotingCard
export { CardText, type CardTextProps }
