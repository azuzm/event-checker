import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateEventRequest, type UpdateEventRequest } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useEvents(filters?: { category?: string; search?: string }) {
  const queryKey = [api.events.list.path, filters?.category, filters?.search].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.search) params.append("search", filters.search);

      const res = await fetch(`${api.events.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      return api.events.list.responses[200].parse(await res.json());
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.events.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch event");
      return api.events.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      // Ensure dates are properly serialized
      const payload = {
        ...data,
        date: new Date(data.date).toISOString() // Zod coerce should handle this but being safe
      };

      const res = await apiRequest("POST", api.events.create.path, payload);
      return api.events.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateEventRequest) => {
      const url = buildUrl(api.events.update.path, { id });
      const res = await apiRequest("PUT", url, data);
      return api.events.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.id] });
    },
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'going' | 'interested' }) => {
      const url = buildUrl(api.events.join.path, { id });
      const res = await apiRequest("POST", url, { status });
      return api.events.join.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.events.attendees.path, variables.id] });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.events.leave.path, { id });
      await apiRequest("DELETE", url);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.events.attendees.path, id] });
    },
  });
}

export function useEventAttendees(id: number) {
  return useQuery({
    queryKey: [api.events.attendees.path, id],
    queryFn: async () => {
      const url = buildUrl(api.events.attendees.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendees");
      return api.events.attendees.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
