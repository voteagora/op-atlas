import VotingCardActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingCardActions"

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
  description: string
}

const CardText = ({ title, description }: CardTextProps) => {
  return (
    <div className="text-center">
      <h4 className="text-h4">{title}</h4>
      <p>{description}</p>
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
    <div className="rounded-t-lg border border-solid p-6 flex flex-col items-center">
      {cardImage && <CardImage {...cardImage} />}
      <CardText {...cardText} />
      {cardActions && <VotingCardActions {...cardActions} />}
    </div>
  )
}

export default VotingCard
export { CardText, type CardTextProps }
