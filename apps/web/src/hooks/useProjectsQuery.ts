import { useQuery } from "@tanstack/react-query";

import { fetchProjects } from "@lib/api";

export const projectsQueryKey = ["projects"];

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  });
}
