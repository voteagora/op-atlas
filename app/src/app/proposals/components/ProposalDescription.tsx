import React from 'react';
import styles from "@/app/proposals/proposalPage.module.scss";
import Markdown from "@/components/common/Markdown/Markdown";

function stripTitleFromDescription(title: string, description: string) {
  if (description.startsWith(`# ${title}`)) {
    const newDescription = description.slice(`# ${title}`.length).trim();
    return newDescription;
  }
  return description;
}

interface ProposalDescriptionProps {
  description: string;
  className?: string;
}

const ProposalDescription = ({ description, className = '' }: ProposalDescriptionProps) => (
  <div className={`${styles.proposal_description_md} ${className}`}>
    <Markdown content={stripTitleFromDescription(description.split('\n')[0].replace('# ', ''), description)} />
  </div>
);

export default ProposalDescription;
