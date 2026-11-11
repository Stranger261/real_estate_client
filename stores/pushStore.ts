import { create } from "zustand";
import {
  getPermission,
  getPushEnabled,
  registerForPush,
  setPushEnabled,
  unregisterPush,
  type PushPermission,
} from "@/lib/push";

interface PushState {
  permission: PushPermission;
  enabled: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  enable: () => Promise<boolean>;
  disable: () => Promise<void>;
}

export const usePushStore = create<PushState>()((set, get) => ({
  permission: "askable",
  enabled: true,
  loaded: false,

  refresh: async () => {
    const [permission, enabled] = await Promise.all([
      getPermission(),
      getPushEnabled(),
    ]);
    set({ permission, enabled, loaded: true });
  },

  enable: async () => {
    await setPushEnabled(true);
    const token = await registerForPush({ ask: true });
    await get().refresh();
    return !!token;
  },

  disable: async () => {
    await setPushEnabled(false);
    await unregisterPush();
    await get().refresh();
  },
}));
