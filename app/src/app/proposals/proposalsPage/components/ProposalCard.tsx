type ProposalCardProps = {
  children: React.ReactNode
}

const ProposalCard = ({ children }: ProposalCardProps) => {
  return (
    <div className="proposal-card-container">
      {/* Standard elements that appear in every card */}
      <div className="proposal-card-header">
        {/* Standard header content */}
      </div>

      {/* The flexible content area */}
      <div className="proposal-card-content">{children}</div>

      {/* Standard footer that appears in every card */}
      <div className="proposal-card-footer">
        {/* Standard footer content */}
      </div>
    </div>
  )
}

export default ProposalCard
