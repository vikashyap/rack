import { useQuery } from "@tanstack/react-query";

import { fetchRackDevices } from "../lib/api";

export const rackDevicesQueryKey = ["rack-devices"] as const;

export function useRackDevicesQuery() {
  return useQuery({
    queryKey: rackDevicesQueryKey,
    queryFn: fetchRackDevices,
  });
}
