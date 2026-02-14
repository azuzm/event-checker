import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateNoticeRequest } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useNotices(category?: string) {
  const queryKey = [api.notices.list.path, category].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      
      const res = await fetch(`${api.notices.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notices");
      return api.notices.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateNoticeRequest) => {
      const res = await apiRequest("POST", api.notices.create.path, data);
      return api.notices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notices.list.path] });
    },
  });
}
