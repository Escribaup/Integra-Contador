import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Credentials, InsertCredentials } from "@shared/schema";

export function useCredentials() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Credentials>({
    queryKey: ["/api/credentials"],
  });

  const saveCredentialsMutation = useMutation({
    mutationFn: async (credentials: InsertCredentials) => {
      const response = await apiRequest("POST", "/api/credentials", credentials);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    saveCredentialsMutation,
  };
}
