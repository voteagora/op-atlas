import ExternalLink from "../ExternalLink"
// import { VideoCallout } from "./VideoCallouts"
import { DocumentCallout, VideoCallout } from "./Callouts"

export const Eligibility = ({ eligibility }: any) => {
  const createLinkedText = (text: string, links: any) => {
    if (links == undefined) return text

    const regex = new RegExp(
      `\\b(${Object.keys(links)
        .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special characters
        .join("|")})\\b`,
      "g",
    )

    // Replace words in the text with links
    const parts = text.split(regex)
    return parts.map((part, index) => {
      const trimmedPart = part.trim()
      if (links[trimmedPart]) {
        return (
          <ExternalLink
            key={index}
            href={links[trimmedPart]}
            className="underline"
          >
            {part}
          </ExternalLink>
        )
      }
      return part
    })
  }

  return (
    <ol>
      {eligibility.criteria.map((criteria: any, index: number) => {
        return (
          <div key={"Eligibility-" + index}>
            {criteria.category && (
              <p className="mt-7 mb-7">
                Additional criteria for{" "}
                <span className="font-bold">{criteria.category + ":"}</span>
              </p>
            )}

            <li>
              <span className="pr-1">{index + 1}.</span>
              <span className="font-bold pr-1">{criteria.name + ":"}</span>
              <span>
                {createLinkedText(criteria.description, criteria.links)}
              </span>
              {
                <ul className="list-disc pl-10">
                  {criteria.criteria?.map(
                    (subCriteria: any, subIndex: number) => {
                      return (
                        <li key={"SubEligibility-" + index + "-" + subIndex}>
                          {subCriteria}
                        </li>
                      )
                    },
                  )}
                </ul>
              }
              {criteria.videoLink && (
                <div className="mt-6 mb-6">
                  {criteria.videoLink.type === "video" ? (
                    <VideoCallout
                      text={criteria.videoLink.text}
                      href={criteria.videoLink.link}
                    />
                  ) : criteria.videoLink.type === "document" ? (
                    <DocumentCallout
                      text={criteria.videoLink.text}
                      href={criteria.videoLink.link}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              )}
            </li>
          </div>
        )
      })}

      {eligibility.contextSpecificCriteria?.map(
        (criteria: any, contextSpecificIndex: number) => {
          return (
            <div
              className="mb-7"
              key={"ContextSpecificEligibility" + contextSpecificIndex}
            >
              <p className="font-bold mb-7">{criteria.name + ":"}</p>

              <ul className="list-disc pl-6">
                {criteria.criteria.map((criterion: any, index: number) => {
                  return (
                    <li key={"LinkedText" + index + " " + contextSpecificIndex}>
                      {createLinkedText(criterion.text, criterion.links)}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        },
      )}
    </ol>
  )
}
