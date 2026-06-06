"use client";
import { useQuery } from "@tanstack/react-query";
import type { AIModel } from "@/types";

export function useModels() {
  const { data, isLoading } = useQuery<{ models: AIModel[] }>({
    queryKey: ["models"],
    queryFn: () => fetch("/api/models").then(r => r.json()),
    staleTime: 60 * 60 * 1000,
  });

  return { models: data?.models ?? [], isLoading };
}
