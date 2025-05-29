import React from 'react';

interface BreadcrumbsProps {
  value: string;
}

const Breadcrumbs = ({ value }: BreadcrumbsProps) => (
  <div className="flex gap-4">{value}</div>
);

export default Breadcrumbs;