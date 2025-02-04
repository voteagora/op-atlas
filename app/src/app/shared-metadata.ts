import { Metadata } from "next"

const sharedKeywords = [
  "optimism retro funding",
  "retro funding",
  "optimism grants",
  "optimism",
  "optimism coin",
  "optimism crypto",
  "op coin",
  "op mainnet",
  "optism",
  "optimism token",
].join(", ")

export const sharedMetadata: Metadata = {
  metadataBase: new URL("https://atlas.optimism.io"),
  icons: "/favicon.ico",
  keywords: sharedKeywords,
  openGraph: {
    title: "Atlas",
    description: "",
    url: "https://atlas.optimism.io",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Atlas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas",
    description: "",
    images: [
      {
        url: "/og-twitter-large.png",
        width: 1200,
        height: 600,
        alt: "Atlas",
      },
      {
        url: "/og-twitter-small.png",
        width: 400,
        height: 400,
        alt: "Atlas",
      },
    ],
  },
}
