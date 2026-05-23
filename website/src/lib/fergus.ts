// Fergus API client — POST /enquiries
// Spec: https://api.fergus.com/docs (OpenAPI 3.1)
// Auth: Bearer Personal Access Token (`fergPAT_…`).

export interface FergusEnquiry {
  name: string;
  email: string;
  phoneNumber: string;
  description: string;
  source: string;
  address1: string;
  addressCity: string;
  address2?: string;
  addressSuburb?: string;
  addressRegion?: string;
  addressPostcode?: string;
  addressCountry?: string;
}

export interface FergusClientConfig {
  baseUrl: string;
  apiKey: string;
  fetcher?: typeof fetch;
}

export interface FergusClient {
  createEnquiry(enquiry: FergusEnquiry): Promise<{ id: string | number }>;
  /** Legacy alias — kept so older call sites and tests keep working. */
  createLead(enquiry: FergusEnquiry): Promise<{ id: string | number }>;
}

export function createFergusClient(cfg: FergusClientConfig): FergusClient {
  const f = cfg.fetcher ?? fetch;
  const baseUrl = cfg.baseUrl.replace(/\/$/, "");

  async function createEnquiry(enquiry: FergusEnquiry): Promise<{ id: string | number }> {
    const res = await f(`${baseUrl}/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(enquiry),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Fergus API ${res.status}: ${body}`);
    }
    const json = (await res.json()) as { result: string; data: { id?: string | number; enquiryId?: string | number } };
    const id = json.data?.id ?? json.data?.enquiryId ?? "";
    return { id };
  }

  return {
    createEnquiry,
    createLead: createEnquiry,
  };
}
