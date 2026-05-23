export interface FergusLead {
  name: string;
  email: string;
  phone: string;
  siteAddress: string;
  description: string;
  source: string;
  jobType?: string;
  siteType?: string;
  urgency?: string;
}

export interface FergusClientConfig {
  baseUrl: string;
  apiKey: string;
  fetcher?: typeof fetch;
}

export interface FergusClient {
  createLead(lead: FergusLead): Promise<{ id: string }>;
}

export function createFergusClient(cfg: FergusClientConfig): FergusClient {
  const f = cfg.fetcher ?? fetch;
  return {
    async createLead(lead) {
      const res = await f(`${cfg.baseUrl}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(lead),
      });
      if (!res.ok) {
        throw new Error(`Fergus API ${res.status}: ${await res.text()}`);
      }
      const json = (await res.json()) as { id: string };
      return { id: json.id };
    },
  };
}
