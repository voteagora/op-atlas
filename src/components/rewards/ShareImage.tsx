/* eslint @next/next/no-img-element: 0 */

import html2canvas from "html2canvas"
import { Sora } from "next/font/google"
import satori from "satori"

import { downloadImageAsPNG } from "@/lib/utils/images"

const sora = Sora({
  subsets: ["latin"],
  variable: "--inter",
})

export const ShareImage = ({
  name,
  amount,
  thumbnailUrl,
  useExternalFont = true,
}: {
  name: string
  amount: number
  thumbnailUrl?: string | null
  useExternalFont?: boolean
}) => {
  return (
    <div
      id="share-image"
      style={{
        ...(useExternalFont ? sora.style : {}),
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 20,
        backgroundImage: "url(/assets/images/round-5-reward.svg)",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      {/* Image, project name, and reward */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 113,
          gap: 20,
        }}
      >
        {thumbnailUrl && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderRadius: 19,
              height: 145,
              width: 145,
            }}
          >
            <img
              alt=""
              src={thumbnailUrl}
              height={140}
              width={140}
              style={{
                height: 140,
                width: 140,
                borderRadius: 15,
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <p
            style={{
              color: "#FE1138",
              fontSize: 24,
              lineHeight: "28px",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontWeight: 600,
              fontSize: 56,
              lineHeight: "64px",
              letterSpacing: "-0.02em",
              backgroundImage:
                "linear-gradient(90deg, #FE1138 0%, #FE4FE2 100%)",
              backgroundClip: "text",
              // @ts-ignore TS doesn't know about webkit prefixes
              "-webkit-background-clip": "text",
              color: "transparent",
              margin: 0,
            }}
          >
            {new Intl.NumberFormat("en-US").format(amount)} OP
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      ></div>
    </div>
  )
}

export async function generateShareImage() {
  try {
    const node = document.querySelector("#share-image")
    if (!node) {
      return
    }

    const canvas = await html2canvas(node as HTMLElement)
    const imageUrl = canvas.toDataURL("image/png")

    const a = document.createElement("a")
    a.href = imageUrl
    a.download = "Image.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(imageUrl)
  } catch (error) {
    console.error("Error generating share image", error)
  }
}

export async function downloadShareImage(
  name: string,
  amount: number,
  thumbnailUrl?: string | null,
) {
  const fonts = await Promise.all([
    fetch("/fonts/Sora-Regular.otf"),
    fetch("/fonts/Sora-SemiBold.otf"),
    fetch("/fonts/Sora-Bold.otf"),
  ])

  const buffers = await Promise.all(
    fonts.map((response) => response.arrayBuffer()),
  )

  const svg = await satori(
    <ShareImage
      name={name}
      amount={amount}
      thumbnailUrl={thumbnailUrl}
      useExternalFont={false}
    />,
    {
      width: 1600,
      height: 900,
      fonts: [
        {
          name: "Sora",
          data: buffers[0],
          weight: 400,
          style: "normal",
        },
        {
          name: "Sora",
          data: buffers[1],
          weight: 600,
          style: "normal",
        },
        {
          name: "Sora",
          data: buffers[2],
          weight: 700,
          style: "normal",
        },
      ],
    },
  )

  await downloadImageAsPNG(svg)
}
