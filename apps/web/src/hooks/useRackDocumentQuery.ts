import { useQuery } from "@tanstack/react-query";

import { fetchRackDocument } from "../lib/api";

export const rackDocumentQueryKey = ["rack-document"] as const;

export function useRackDocumentQuery() {
  return useQuery({
    queryKey: rackDocumentQueryKey,
    queryFn: fetchRackDocument,
  });
}
