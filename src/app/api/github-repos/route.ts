import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { accessToken } = req.body // Obtain the access token from the request

  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  })

  const repos = await response.json()
  res.status(200).json({ repos })
}
