import { useQuery } from "@tanstack/react-query"

import { getGithubProximity } from "@/db/githubProxomity"

function useGithubProximity(username: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["githubProximity", username],
    queryFn: () => getGithubProximity(username),
  })

  return { data, isLoading, error }
}

export default useGithubProximity
