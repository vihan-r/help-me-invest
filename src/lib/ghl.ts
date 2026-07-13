import "server-only";

/**
 * Minimal GoHighLevel (LeadConnector v2) client — server-only, so the API token
 * never reaches the browser. Creates/updates a contact (upsert de-dupes by
 * email/phone within the location) and optionally attaches the message as a note.
 * Auth is a Private Integration Token (`GHL_API_KEY`) scoped to contacts.
 */
const API_BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

export interface GhlContactInput {
  firstName: string;
  email: string;
  phone?: string;
  /** Tags for routing, e.g. ["talk-to-expert", "intent:first"]. */
  tags: string[];
  /** Where the contact came from (shown in GHL). */
  source: string;
  /** Free-text detail (the message / a summary), attached as a note. */
  note?: string;
  /**
   * Custom-field writes by GHL field key (bare key, e.g. "contact_form_message").
   * Written on the contact so GHL workflow emails can merge them (notes/tags
   * can't be merged into emails).
   */
  customFields?: { key: string; value: string }[];
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function createGhlContact(input: GhlContactInput): Promise<void> {
  const token = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error("GoHighLevel is not configured (GHL_API_KEY / GHL_LOCATION_ID)");
  }

  const res = await fetch(`${API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: headers(token),
    cache: "no-store",
    body: JSON.stringify({
      locationId,
      firstName: input.firstName,
      email: input.email,
      phone: input.phone,
      tags: input.tags,
      source: input.source,
      customFields: input.customFields?.map((f) => ({ key: f.key, field_value: f.value })),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GHL contact upsert failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  // Attach the message as a note. A note failure must not fail the lead itself —
  // the contact is already captured, which is the thing that matters.
  if (input.note) {
    const data = (await res.json().catch(() => null)) as { contact?: { id?: string } } | null;
    const contactId = data?.contact?.id;
    if (contactId) {
      await fetch(`${API_BASE}/contacts/${contactId}/notes`, {
        method: "POST",
        headers: headers(token),
        cache: "no-store",
        body: JSON.stringify({ body: input.note }),
      }).catch(() => {});
    }
  }
}
