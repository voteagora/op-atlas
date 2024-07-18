/* eslint @next/next/no-img-element: 0 */

import { toPng } from "html-to-image"
import { Sora } from "next/font/google"

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
        padding: 22,
        backgroundImage: "url(/assets/images/social-share-background.png)",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: 24,
            lineHeight: "34px",
            letterSpacing: "-0.06em",
            backgroundImage:
              "linear-gradient(91.16deg, #9E3CE9 5.19%, #523EFF 132.43%)",

            // backgroundImage: "linear-gradient(90deg, #9E3CE9 0%, #523EFF 100%)",
            backgroundClip: "text",
            // @ts-ignore TS doesn't know about webkit prefixes
            "-webkit-background-clip": "text",
            color: "transparent",
            margin: 0,
          }}
        >
          Retro Funding 4
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: 34,
            lineHeight: "34px",
            letterSpacing: "-0.06em",
            backgroundImage:
              "linear-gradient(90.8deg, #9E3CE9 -16.44%, #523EFF 134.15%)",
            backgroundClip: "text",
            // @ts-ignore TS doesn't know about webkit prefixes
            "-webkit-background-clip": "text",
            color: "transparent",
            margin: 0,
          }}
        >
          Onchain Builders
        </p>
      </div>

      {/* Image, project name, and reward */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
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
              padding: 3.5,
              background: "linear-gradient(180deg, #FF0420 0%, #8935DE 100%)",
            }}
          >
            <img
              alt=""
              src={thumbnailUrl}
              height={138}
              width={138}
              style={{
                height: 138,
                width: 138,
                borderRadius: 15.83,
                // overflow: "hidden",
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
              color: "#8D33DB",
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
                "linear-gradient(90deg, #8D33DB 0%, #523EFF 100%)",
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
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <img
          alt=""
          src="/assets/images/optimism-small.png"
          width={34}
          height={34}
        />
        <p
          style={{
            fontWeight: 400,
            fontSize: 12,
            lineHeight: "normal",
            letterSpacing: "-0.06em",
            backgroundImage: "linear-gradient(90deg, #8D33DB 0%, #523EFF 100%)",
            backgroundClip: "text",
            // @ts-ignore TS doesn't know about webkit prefixes
            "-webkit-background-clip": "text",
            color: "transparent",
            margin: 0,
          }}
        >
          retrofunding.optimism.io
        </p>
      </div>
    </div>
  )
}

export const htmlToImageConvert = () => {
  const node = document.getElementById("share-image")

  if (node)
    toPng(node)
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = "image.png"
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
}
