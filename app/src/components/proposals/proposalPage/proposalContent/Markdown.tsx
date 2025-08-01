import React from "react"
import ReactMarkdown from "react-markdown"

interface ProposalContentProps {
  description: string
}

// Function to convert URLs in text to clickable links
const convertUrlsToLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

const Markdown = ({ description }: ProposalContentProps) => (
  <div className="prose prose-gray max-w-none">
    <ReactMarkdown
      components={{
        p: ({ children }) => {
          // Convert URLs to links in paragraph text
          if (typeof children === "string") {
            return (
              <p className="mb-2 leading-normal text-text-default">
                {convertUrlsToLinks(children)}
              </p>
            )
          }
          return (
            <p className="mb-2 leading-normal text-text-default">{children}</p>
          )
        },
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-2 mt-4 text-text-default">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mb-2 mt-3 text-text-default">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-medium mb-1 mt-2 text-text-default">
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-0.5">
            {children}
          </ol>
        ),
        li: ({ children }) => {
          // Convert URLs to links in list item text
          if (typeof children === "string") {
            return (
              <li className="leading-normal text-text-default">
                {convertUrlsToLinks(children)}
              </li>
            )
          }
          return (
            <li className="leading-normal text-text-default">{children}</li>
          )
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2 text-gray-600">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-3 rounded mb-2 overflow-x-auto">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {children}
          </a>
        ),
      }}
    >
      {description}
    </ReactMarkdown>
  </div>
)

export default Markdown
