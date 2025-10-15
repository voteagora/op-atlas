"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserKYCStatus, getPersonalKYCForUser } from "@/lib/actions/userKyc"

export function useUserKYCStatus(userId?: string) {
  return useQuery({
    queryKey: ["userKYCStatus", userId],
    queryFn: () => getUserKYCStatus(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function usePersonalKYC() {
  return useQuery({
    queryKey: ["personalKYC"],
    queryFn: getPersonalKYCForUser,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}