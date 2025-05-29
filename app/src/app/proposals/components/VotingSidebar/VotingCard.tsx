interface CardImageProps {
  src: string
  alt: string
}

const CardImage = ({ src, alt }: CardImageProps) => {
  return (
    <div>
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
    <div>
      <h4 className="text-h4">{title}</h4>
      <p>{description}</p>
    </div>
  )
}

interface CardActionsProps {
  cardActions: CardAction[]
}

interface CardAction {
  buttonStyle: string
  actionText: string
  onClick: () => void
}

const CardActions = ({ cardActions }: CardActionsProps) => {
  return (
    <div>
      {cardActions.map(({ buttonStyle, actionText, onClick }, idx) => (
        <button key={idx} onClick={onClick}>
          {actionText}
        </button>
      ))}
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
    <div>
      {cardImage && <CardImage {...cardImage} />}
      <CardText {...cardText} />
      {cardActions && <CardActions {...cardActions} />}
    </div>
  )
}

export default VotingCard
export { CardText, type CardTextProps }
