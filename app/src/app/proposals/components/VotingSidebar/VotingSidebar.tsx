import React from "react"
import VotingCard from "@/app/proposals/components/VotingSidebar/VotingCard"
import VotingColumn from "@/app/proposals/components/VotingSidebar/VotingColumn"
import VotingRedirect from "@/app/proposals/components/VotingSidebar/VotingRedirect"

interface VotingSidebarProps {
  className?: string
}

const VotingSidebar = ({ className = "" }: VotingSidebarProps) => (
  <div className={`flex flex-col ${className}`}>
    <VotingCard />
    <VotingColumn />
    <VotingRedirect />
  </div>
)

export default VotingSidebar
