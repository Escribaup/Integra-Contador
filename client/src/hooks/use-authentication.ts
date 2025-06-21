import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AuthTokens } from "@shared/schema";

export function useAuthentication() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AuthTokens>({
    queryKey: ["/api/auth/tokens"],
  });

  const authenticateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/authenticate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/tokens"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    authenticateMutation,
  };
}
