import React from 'react';

interface ProposalStatusProps {
  status: string;
  className?: string;
}

const ProposalStatus = ({ status, className = '' }: ProposalStatusProps) => (
  <div className={`text-h2 ${className}`}>{status}</div>
);

export default ProposalStatus;
