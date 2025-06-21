import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Certificate } from "@shared/schema";

export function useCertificate() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Certificate>({
    queryKey: ["/api/certificate"],
  });

  const uploadCertificateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/certificate/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificate"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    uploadCertificateMutation,
  };
}
