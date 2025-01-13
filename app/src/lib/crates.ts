function getCrateUrl(crateName: string): string {
  //Option 1:
  return `https://crates.io/api/v1/crates/${encodeURIComponent(crateName)}`

  //OPTION 2 (Crate's suggested method. However believed to be updated infrequently):
  // const part1 = crateName[0]
  // const part2 = crateName.length > 1 ? crateName[1] : "_"
  // return `https://index.crates.io/${part1}/${part2}/${crateName}`
}

export async function getCrate(name: string) {
  try {
    const url = getCrateUrl(name)
    const response = await fetch(url, {
      headers: {
        "User-Agent": `OP Atlas (${process.env.CRATE_USER_AGENT_CONTACT})`,
      },
    })

    const pkg = await response.json()
    return pkg
  } catch (error: unknown) {
    return null
  }
}
