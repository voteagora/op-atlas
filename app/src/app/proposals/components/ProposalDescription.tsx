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
}

const ProposalDescription = ({ description }: ProposalDescriptionProps) => (
  <div className="flex gap-8 lg:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
    <div className={styles.proposal_description_md}>
      <Markdown content={stripTitleFromDescription(description.split('\n')[0].replace('# ', ''), description)} />
    </div>
  </div>
);

export default ProposalDescription;