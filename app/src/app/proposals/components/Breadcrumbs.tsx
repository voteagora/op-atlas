import React from 'react';

interface BreadcrumbsProps {
  value: string;
  className?: string;
}

const Breadcrumbs = ({ value, className = '' }: BreadcrumbsProps) => (
  <div className={`flex gap-4 ${className}`}>{value}</div>
);

export default Breadcrumbs;
