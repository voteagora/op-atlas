import React from 'react';

interface ProposalTitleProps {
  title: string;
}

const ProposalTitle = ({ title }: ProposalTitleProps) => (
  <div className="text-h2">{title}</div>
);

export default ProposalTitle;