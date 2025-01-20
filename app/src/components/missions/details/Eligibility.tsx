import ExternalLink from "../../ExternalLink"
import { VideoCallout } from "../common/callouts/VideoCallout"
import { DocumentCallout } from "../common/callouts/DocumentCallout"
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
    <div className="flex flex-col gap-6 mb-10">
      <p className="text-xl font-semibold">Eligibility</p>
      <p className="font-light">Applications must meet these criteria:</p>

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
                      <li
                        key={"LinkedText" + index + " " + contextSpecificIndex}
                      >
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

      <p>
        {
          "To add your project to OP Atlas, first sign in or sign up using Farcaster. From your signed in dashboard, choose “Add project” and proceed with project setup. A project can’t be considered eligible until it’s setup is complete."
        }
      </p>

      <VideoCallout
        text="How to add a project in OP Atlas"
        href="https://youtube.com"
      />
    </div>
  )
}
