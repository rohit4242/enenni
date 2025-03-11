"use client";

import { getCurrentUser } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
  return query;
};

export default useAuth;