import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  type IntegrationConfig,
  type PropertyMappingConfig,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type ValueMapping,
} from "@/lib/ee/integration-provider/types";

export type WizardStep = 1 | 2 | 3 | 4;

const SYNC_INTERVAL_OPTIONS = [null, 15, 30, 60, 360, 1440] as const;
export { SYNC_INTERVAL_OPTIONS };

interface CreatedItem {
  id: number;
  name: string;
}

interface WizardState {
  // Step 3 - Items created on-the-fly during mapping
  additionalBoards: CreatedItem[];
  additionalStatuses: CreatedItem[];
  // Step 1 - Connection
  apiKey: string;
  boardMapping: Record<string, ValueMapping>;
  botName: string;
  connectionStatus: "error" | "idle" | "success" | "testing";

  // Step 2 - Database selection
  databases: RemoteDatabase[];
  errorMessage: string;
  // Step 4 - Sync configuration
  integrationName: string;

  loadingDatabases: boolean;
  loadingSchema: boolean;
  propertyMapping: PropertyMappingConfig;
  // Step 3 - Property mapping
  schema: null | RemoteDatabaseSchema;
  selectedDatabaseId: null | string;

  statusMapping: Record<string, ValueMapping>;
  // Navigation
  step: WizardStep;
  syncDirection: "bidirectional" | "inbound" | "outbound";

  syncIntervalMinutes: null | number;
}

interface WizardActions {
  addAdditionalBoard: (board: CreatedItem) => void;
  addAdditionalStatus: (status: CreatedItem) => void;
  buildConfig: () => IntegrationConfig;
  canGoNext: () => boolean;
  getUnmappedStatusOptions: () => Array<{ id: string; name: string }>;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
  setBoardMapping: (notionOptionId: string, mapping: ValueMapping) => void;
  setConnectionError: (error: string) => void;
  setConnectionSuccess: (botName: string) => void;
  setConnectionTesting: () => void;
  setDatabases: (databases: RemoteDatabase[]) => void;
  setIntegrationName: (name: string) => void;
  setLoadingDatabases: (loading: boolean) => void;
  setLoadingSchema: (loading: boolean) => void;
  setPropertyMapping: (key: keyof PropertyMappingConfig, value: PropertyMappingConfig[typeof key]) => void;
  setSchema: (schema: RemoteDatabaseSchema) => void;
  setSelectedDatabaseId: (id: string) => void;
  setStatusMapping: (notionOptionId: string, mapping: ValueMapping) => void;
  setSyncDirection: (direction: "bidirectional" | "inbound" | "outbound") => void;
  setSyncIntervalMinutes: (minutes: null | number) => void;
  updateApiKey: (apiKey: string) => void;
}

const initialState: WizardState = {
  step: 1,
  apiKey: "",
  connectionStatus: "idle",
  botName: "",
  errorMessage: "",
  databases: [],
  selectedDatabaseId: null,
  loadingDatabases: false,
  schema: null,
  loadingSchema: false,
  propertyMapping: { title: "" },
  statusMapping: {},
  boardMapping: {},
  additionalStatuses: [],
  additionalBoards: [],
  integrationName: "",
  syncDirection: "bidirectional",
  syncIntervalMinutes: null,
};

export const useNotionWizardStore = create<WizardActions & WizardState>()(
  immer((set, get) => ({
    ...initialState,

    addAdditionalStatus: (status: CreatedItem) => {
      set(draft => {
        draft.additionalStatuses.push(status);
      });
    },

    addAdditionalBoard: (board: CreatedItem) => {
      set(draft => {
        draft.additionalBoards.push(board);
      });
    },

    updateApiKey: (apiKey: string) => {
      set(draft => {
        draft.apiKey = apiKey;
        draft.connectionStatus = "idle";
        draft.errorMessage = "";
      });
    },

    setConnectionTesting: () => {
      set(draft => {
        draft.connectionStatus = "testing";
        draft.errorMessage = "";
      });
    },

    setConnectionSuccess: (botName: string) => {
      set(draft => {
        draft.connectionStatus = "success";
        draft.botName = botName;
      });
    },

    setConnectionError: (error: string) => {
      set(draft => {
        draft.connectionStatus = "error";
        draft.errorMessage = error;
      });
    },

    setLoadingDatabases: (loading: boolean) => {
      set(draft => {
        draft.loadingDatabases = loading;
      });
    },

    setDatabases: (databases: RemoteDatabase[]) => {
      set(draft => {
        draft.databases = databases;
        draft.loadingDatabases = false;
      });
    },

    setSelectedDatabaseId: (id: string) => {
      set(draft => {
        draft.selectedDatabaseId = id;
        const db = draft.databases.find(d => d.id === id);
        if (db && !draft.integrationName) {
          draft.integrationName = `Notion - ${db.name}`;
        }
      });
    },

    setLoadingSchema: (loading: boolean) => {
      set(draft => {
        draft.loadingSchema = loading;
      });
    },

    setSchema: (schema: RemoteDatabaseSchema) => {
      set(draft => {
        draft.schema = schema;
        draft.loadingSchema = false;
        // Auto-detect title property
        const titleProp = schema.properties.find(p => p.type === "title");
        if (titleProp) {
          draft.propertyMapping.title = titleProp.name;
        }
        // Default description to page content
        draft.propertyMapping.description = { type: "page_content" };
        // Auto-detect native Notion "status" property
        const statusProp = schema.properties.find(p => p.type === "status");
        if (statusProp) {
          draft.propertyMapping.status = { name: statusProp.name, type: "status" };
        }
      });
    },

    setPropertyMapping: (key, value) => {
      set(draft => {
        (draft.propertyMapping as Record<string, unknown>)[key] = value;
      });
    },

    setStatusMapping: (notionOptionId: string, mapping: ValueMapping) => {
      set(draft => {
        draft.statusMapping[notionOptionId] = mapping;
      });
    },

    setBoardMapping: (notionOptionId: string, mapping: ValueMapping) => {
      set(draft => {
        draft.boardMapping[notionOptionId] = mapping;
      });
    },

    setIntegrationName: (name: string) => {
      set(draft => {
        draft.integrationName = name;
      });
    },

    setSyncDirection: direction => {
      set(draft => {
        draft.syncDirection = direction;
      });
    },

    setSyncIntervalMinutes: minutes => {
      set(draft => {
        draft.syncIntervalMinutes = minutes;
      });
    },

    canGoNext: (): boolean => {
      const state = get();
      switch (state.step) {
        case 1:
          return state.connectionStatus === "success";
        case 2:
          return !!state.selectedDatabaseId && !!state.schema;
        case 3:
          return !!state.propertyMapping.title;
        case 4:
          return !!state.integrationName;
        default:
          return false;
      }
    },

    goNext: () => {
      const state = get();
      if (!state.canGoNext()) return;
      set(draft => {
        if (draft.step < 4) draft.step = (draft.step + 1) as WizardStep;
      });
    },

    goPrev: () => {
      set(draft => {
        if (draft.step > 1) draft.step = (draft.step - 1) as WizardStep;
      });
    },

    reset: () => {
      set(() => ({ ...initialState }));
    },

    getUnmappedStatusOptions: () => {
      const state = get();
      if (!state.propertyMapping.status || !state.schema) return [];
      const statusProp = state.schema.properties.find(p => p.name === state.propertyMapping.status?.name);
      if (!statusProp?.options) return [];
      return statusProp.options
        .filter(opt => !state.statusMapping[opt.id])
        .map(opt => ({ id: opt.id, name: opt.name }));
    },

    buildConfig: (): IntegrationConfig => {
      const state = get();
      const selectedDb = state.databases.find(d => d.id === state.selectedDatabaseId);
      return {
        apiKey: state.apiKey,
        databaseId: state.selectedDatabaseId ?? "",
        databaseName: selectedDb?.name ?? "",
        propertyMapping: state.propertyMapping,
        statusMapping: state.statusMapping,
        boardMapping: state.boardMapping,
        syncDirection: state.syncDirection,
      };
    },
  })),
);
