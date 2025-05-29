import React from 'react';

interface ProposalTitleProps {
  title: string;
  className?: string;
}

const ProposalTitle = ({ title, className = '' }: ProposalTitleProps) => (
  <div className={`text-h2 ${className}`}>{title}</div>
);

export default ProposalTitle;
