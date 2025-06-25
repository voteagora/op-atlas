const useCitizenshipEligibility = () => {
  const { data: citizen } = useUserCitizen()
  const { data: citizenEligibility } = useCitizenEligibility(citizen)
}

export default useCitizenshipEligibility
