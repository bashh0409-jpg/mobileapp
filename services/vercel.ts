import * as SecureStore from "expo-secure-store";

const VERCEL_TOKEN_KEY = "vercel_token";
const BASE_URL = "https://api.vercel.com";

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// ── Token management ──────────────────────────────────────────────

export const setVercelToken = async (token: string) => {
  await SecureStore.setItemAsync(VERCEL_TOKEN_KEY, token);
};

export const getVercelToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(VERCEL_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearVercelToken = async () => {
  await SecureStore.deleteItemAsync(VERCEL_TOKEN_KEY);
};

// ── API helpers ───────────────────────────────────────────────────

const fetchWithAuth = async <T>(
  endpoint: string,
  token: string,
  options?: RequestInit,
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...((options?.headers as Record<string, string>) ?? {}),
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${errBody}`);
  }

  return res.json();
};

// ── User ──────────────────────────────────────────────────────────

export interface VercelUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string | null;
}

export const getUser = async (token: string): Promise<VercelUser> => {
  const data = await fetchWithAuth<{ user: VercelUser }>("/v2/user", token);
  return data.user;
};

// ── Projects ──────────────────────────────────────────────────────

export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  createdAt: number;
  updatedAt: number;
  sourceFilesOutsideRootDirectory: boolean;
  latestDeployments?: VercelDeployment[];
}

export const getProjects = async (token: string): Promise<VercelProject[]> => {
  const data = await fetchWithAuth<{ projects: VercelProject[] }>(
    "/v9/projects?limit=100",
    token,
  );
  return data.projects;
};

// ── Deployments ──────────────────────────────────────────────────

export interface VercelDeployment {
  uid: string;
  id: string;
  name: string;
  url: string;
  source: string;
  state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
  createdAt: number;
  createdAtMs: number;
  meta: Record<string, string>;
}

export const getDeployments = async (
  token: string,
  projectId: string,
  limit = 30,
): Promise<VercelDeployment[]> => {
  const data = await fetchWithAuth<{ deployments: VercelDeployment[] }>(
    `/v6/deployments?projectId=${projectId}&limit=${limit}`,
    token,
  );
  return data.deployments;
};

// ── Deployment Events / Logs ─────────────────────────────────────

export interface DeploymentEvent {
  type: string;
  created: number;
  payload: Record<string, unknown>;
}

export const getDeploymentEvents = async (
  token: string,
  deploymentId: string,
): Promise<DeploymentEvent[]> => {
  const data = await fetchWithAuth<{ events: DeploymentEvent[] }>(
    `/v1/deployments/${deploymentId}/events`,
    token,
  );
  return data.events;
};

// ── Project Analytics ────────────────────────────────────────────

export interface ProjectAnalytics {
  totalDeployments: number;
  readyDeployments: number;
  failedDeployments: number;
  canceledDeployments: number;
  lastDeploymentAt: number | null;
  totalDeploymentTime: number; // ms
  averageDeploymentTime: number; // ms
  frameworks: string[];
  teamMembers: number;
  productionDomains: string[];
}

/**
 * Derive analytics for a project from its deployments and project metadata.
 */
export const getProjectAnalytics = (
  project: VercelProject,
  deployments: VercelDeployment[],
): ProjectAnalytics => {
  const ready = deployments.filter((d) => d.state === "READY");
  const failed = deployments.filter((d) => d.state === "ERROR");
  const canceled = deployments.filter((d) => d.state === "CANCELED");

  const lastDeployment = deployments.reduce<VercelDeployment | null>(
    (latest, d) =>
      !latest || d.createdAt > latest.createdAt ? d : latest,
    null,
  );

  // Estimate deployment time: difference between first and last event time
  // (rough approximation from creation timestamps of sorted deployments)
  const sortedByTime = [...deployments].sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  const totalTime =
    sortedByTime.length > 1
      ? sortedByTime[sortedByTime.length - 1].createdAt -
        sortedByTime[0].createdAt
      : 0;

  const avgTime = ready.length > 0 ? totalTime / ready.length : 0;

  return {
    totalDeployments: deployments.length,
    readyDeployments: ready.length,
    failedDeployments: failed.length,
    canceledDeployments: canceled.length,
    lastDeploymentAt: lastDeployment?.createdAt ?? null,
    totalDeploymentTime: totalTime,
    averageDeploymentTime: avgTime,
    frameworks: project.framework ? [project.framework] : [],
    teamMembers: 0,
    productionDomains: [project.name],
  };
};

// ── Production Deployment (latest ready) ─────────────────────────

export const getProductionDeployment = (
  deployments: VercelDeployment[],
): VercelDeployment | undefined => {
  return deployments
    .filter((d) => d.state === "READY")
    .sort((a, b) => b.createdAt - a.createdAt)[0];
};