import React from 'react';

interface VotingSidebarProps {
  className?: string;
}

const VotingSidebar = ({ className = '' }: VotingSidebarProps) => (
  <div className={`flex flex-col gap-4 ${className}`}></div>
);

export default VotingSidebar;
