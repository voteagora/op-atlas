import React from 'react';

interface ProposalStatusProps {
  status: string;
}

const ProposalStatus = ({ status }: ProposalStatusProps) => (
  <div className="text-h2">{status}</div>
);

export default ProposalStatus;