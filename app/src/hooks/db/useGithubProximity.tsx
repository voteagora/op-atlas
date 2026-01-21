import { useQuery } from "@tanstack/react-query"

import { fetchGithubProximity } from "@/lib/actions/hookFetchers"

function useGithubProximity(username: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["githubProximity", username],
    queryFn: () => fetchGithubProximity(username),
  })

  return { data, isLoading, error }
}

export default useGithubProximity
