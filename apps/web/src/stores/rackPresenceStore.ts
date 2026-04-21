import { create } from "zustand";

import type { RackCollaborator } from "@lib/rack-collaboration";

type RackPresenceStore = {
  users: RackCollaborator[];
  setUsers: (users: RackCollaborator[]) => void;
};

export const useRackPresenceStore = create<RackPresenceStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));
