import Debug from 'debug';
import { IMCPConfig, IMCPServer } from 'types/mcp';
import { create } from 'zustand';

const debug = Debug('5ire:stores:useMCPStore');

export interface IMCPStore {
  isLoading: boolean;
  config: IMCPConfig;
  updateLoadingState: (isLoading: boolean) => void;
  loadConfig: (force?: boolean) => Promise<IMCPConfig>;
  addServer: (server: IMCPServer) => Promise<boolean>;
  activateServer: (
    key: string,
    command?: string,
    args?: string[],
    env?: Record<string, string>,
  ) => Promise<boolean>;
  deactivateServer: (key: string) => Promise<boolean>;
}

const useMCPStore = create<IMCPStore>((set, get) => ({
  isLoading: true,
  config: { servers: [] },
  updateLoadingState: (isLoading: boolean) => {
    set({ isLoading });
  },
  loadConfig: async (force?: boolean) => {
    if (!force && get().config.servers.length > 0) {
      return get().config;
    }
    const config = await window.electron.mcp.getConfig();
    set({ config });
    return config;
  },
  addServer: async (server: IMCPServer) => {
    const { servers } = get().config;
    if (!servers.find((svr) => svr.key === server.key)) {
      const ok = await window.electron.mcp.addServer(server);
      if (ok) {
        get().loadConfig(true);
        return true;
      }
    }
    return false;
  },
  activateServer: async (
    key: string,
    command?: string,
    args?: string[],
    env?: Record<string, string>,
  ) => {
    debug('Activating server:', {
      key: key,
      command: command,
      args: args,
      env: env,
    });
    const { error } = await window.electron.mcp.activate({
      key: key,
      command: command,
      args: args,
      env: env,
    });
    if (error) {
      throw new Error(error);
    }
    await get().loadConfig(true);
    return true;
  },
  deactivateServer: async (key: string) => {
    const { error } = await window.electron.mcp.deactivated(key);
    if (error) {
      throw new Error(error);
    }
    await get().loadConfig(true);
    return true;
  },
}));

export default useMCPStore;
