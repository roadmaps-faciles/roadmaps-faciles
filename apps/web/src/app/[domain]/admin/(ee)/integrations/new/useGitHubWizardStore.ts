import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  type GitHubSourceType,
  type IntegrationConfig,
  type RemoteDatabase,
  type RemoteDatabaseSchema,
  type ValueMapping,
} from "@/lib/ee/integration-provider/types";

export type GitHubWizardStep = 1 | 2 | 3 | 4 | 5;

interface GitHubWizardState {
  apiKey: string;
  authType: "app" | "pat";
  boardMapping: Record<string, ValueMapping>;
  connectionBotName: string;
  connectionStatus: "error" | "idle" | "success" | "testing";
  errorMessage: string;
  includePullRequests: boolean;
  installationId: null | number;
  integrationName: string;
  loadingRepos: boolean;
  loadingSchema: boolean;
  repositories: RemoteDatabase[];
  schema: null | RemoteDatabaseSchema;
  selectedRepoId: string;
  sourceType: GitHubSourceType;
  statusMapping: Record<string, ValueMapping>;
  step: GitHubWizardStep;
  syncDirection: "bidirectional" | "inbound" | "outbound";
  syncIntervalMinutes: null | number;
}

interface GitHubWizardActions {
  buildConfig: () => IntegrationConfig;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
  setApiKey: (apiKey: string) => void;
  setAppInstallation: (installationId: number, botName: string) => void;
  setAuthType: (authType: "app" | "pat") => void;
  setBoardMapping: (optionId: string, mapping: ValueMapping) => void;
  setConnectionError: (error: string) => void;
  setConnectionStatus: (status: GitHubWizardState["connectionStatus"]) => void;
  setConnectionSuccess: (botName: string) => void;
  setIncludePullRequests: (include: boolean) => void;
  setIntegrationName: (name: string) => void;
  setLoadingRepos: (loading: boolean) => void;
  setLoadingSchema: (loading: boolean) => void;
  setRepositories: (repos: RemoteDatabase[]) => void;
  setSchema: (schema: RemoteDatabaseSchema) => void;
  setSelectedRepoId: (repoId: string) => void;
  setSourceType: (type: GitHubSourceType) => void;
  setStatusMapping: (optionId: string, mapping: ValueMapping) => void;
  setSyncDirection: (direction: GitHubWizardState["syncDirection"]) => void;
  setSyncIntervalMinutes: (minutes: null | number) => void;
}

const initialState: GitHubWizardState = {
  step: 1,
  apiKey: "",
  authType: "pat",
  installationId: null,
  connectionStatus: "idle",
  connectionBotName: "",
  errorMessage: "",
  sourceType: "issues",
  includePullRequests: false,
  repositories: [],
  loadingRepos: false,
  selectedRepoId: "",
  schema: null,
  loadingSchema: false,
  statusMapping: {},
  boardMapping: {},
  syncDirection: "bidirectional",
  syncIntervalMinutes: null,
  integrationName: "",
};

export const SYNC_INTERVAL_OPTIONS = [null, 15, 30, 60, 360, 1440] as const;

export const useGitHubWizardStore = create<GitHubWizardActions & GitHubWizardState>()(
  immer((set, get) => ({
    ...initialState,

    setApiKey: (apiKey: string) => {
      set(draft => {
        draft.apiKey = apiKey;
        draft.connectionStatus = "idle";
        draft.errorMessage = "";
      });
    },

    setAuthType: (authType: "app" | "pat") => {
      set(draft => {
        draft.authType = authType;
        draft.connectionStatus = "idle";
        draft.errorMessage = "";
        if (authType === "pat") {
          draft.installationId = null;
        } else {
          draft.apiKey = "";
        }
      });
    },

    setAppInstallation: (installationId: number, botName: string) => {
      set(draft => {
        draft.authType = "app";
        draft.installationId = installationId;
        draft.connectionStatus = "success";
        draft.connectionBotName = botName;
        draft.apiKey = "";
        draft.errorMessage = "";
      });
    },

    setConnectionStatus: status => {
      set(draft => {
        draft.connectionStatus = status;
      });
    },

    setConnectionSuccess: (botName: string) => {
      set(draft => {
        draft.connectionStatus = "success";
        draft.connectionBotName = botName;
      });
    },

    setConnectionError: (error: string) => {
      set(draft => {
        draft.connectionStatus = "error";
        draft.errorMessage = error;
      });
    },

    setSourceType: type => {
      set(draft => {
        draft.sourceType = type;
      });
    },

    setIncludePullRequests: include => {
      set(draft => {
        draft.includePullRequests = include;
      });
    },

    setRepositories: repos => {
      set(draft => {
        draft.repositories = repos;
        draft.loadingRepos = false;
      });
    },

    setLoadingRepos: loading => {
      set(draft => {
        draft.loadingRepos = loading;
      });
    },

    setSelectedRepoId: repoId => {
      set(draft => {
        draft.selectedRepoId = repoId;
        const repo = draft.repositories.find(r => r.id === repoId);
        if (repo && !draft.integrationName) {
          draft.integrationName = `GitHub — ${repo.name}`;
        }
      });
    },

    setSchema: schema => {
      set(draft => {
        draft.schema = schema;
        draft.loadingSchema = false;
      });
    },

    setLoadingSchema: loading => {
      set(draft => {
        draft.loadingSchema = loading;
      });
    },

    setStatusMapping: (optionId, mapping) => {
      set(draft => {
        draft.statusMapping[optionId] = mapping;
      });
    },

    setBoardMapping: (optionId, mapping) => {
      set(draft => {
        draft.boardMapping[optionId] = mapping;
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

    setIntegrationName: name => {
      set(draft => {
        draft.integrationName = name;
      });
    },

    goNext: () => {
      set(draft => {
        if (draft.step < 5) draft.step = (draft.step + 1) as GitHubWizardStep;
      });
    },

    goPrev: () => {
      set(draft => {
        if (draft.step > 1) draft.step = (draft.step - 1) as GitHubWizardStep;
      });
    },

    reset: () => {
      set(() => ({ ...initialState }));
    },

    buildConfig: (): IntegrationConfig => {
      const state = get();
      const selectedRepo = state.repositories.find(r => r.id === state.selectedRepoId);
      return {
        apiKey: state.authType === "pat" ? state.apiKey : "",
        authType: state.authType,
        installationId: state.installationId ?? undefined,
        databaseId: state.selectedRepoId,
        databaseName: selectedRepo?.name ?? "",
        sourceType: state.sourceType,
        includePullRequests: state.includePullRequests,
        propertyMapping: { title: "title" },
        statusMapping: state.statusMapping,
        boardMapping: state.boardMapping,
        syncDirection: state.syncDirection,
      };
    },
  })),
);
