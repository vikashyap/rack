import { useQuery } from "@tanstack/react-query";

import { fetchDevices } from "@lib/api";

export const devicesQueryKey = ["devices"] as const;

export function useDevicesQuery() {
  return useQuery({
    queryKey: devicesQueryKey,
    queryFn: fetchDevices,
  });
}
