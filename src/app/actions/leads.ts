"use server";

import { headers } from "next/headers";
import { createGhlContact } from "@/lib/ghl";
import {
  contactLeadSchema,
  expertLeadSchema,
  intentLabel,
  timingLabel,
  topicLabel,
} from "@/lib/leadSchemas";
import { rateLimit } from "@/lib/rateLimit";

export type LeadResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR =
  "Something went wrong sending this. Please try again in a moment, or email hello@helpmeinvest.com.au.";
const RATE_LIMITED =
  "That's a few submissions in a short time — please wait a few minutes and try again.";

/** Best-effort client IP from proxy headers (Railway sets x-forwarded-for). */
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Hidden honeypot field — real users never fill it; bots often do. */
function honeypotFilled(input: unknown): boolean {
  const v = (input as { company?: unknown } | null)?.company;
  return typeof v === "string" && v.trim().length > 0;
}

/** Talk-to-an-expert intake → a tagged contact in GoHighLevel. */
export async function submitExpertLead(input: unknown): Promise<LeadResult> {
  // Silently accept honeypot hits so bots don't learn they were caught.
  if (honeypotFilled(input)) return { ok: true };
  if (!rateLimit(`expert:${await clientIp()}`)) return { ok: false, error: RATE_LIMITED };

  const parsed = expertLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form and try again." };
  const d = parsed.data;

  try {
    await createGhlContact({
      firstName: d.firstName,
      email: d.email,
      phone: d.phone,
      source: "Website — Talk to an expert",
      tags: ["talk-to-expert", `intent:${d.intent}`, `timing:${d.timing}`],
      note: [
        "Talk to an expert",
        `Intent: ${intentLabel(d.intent)}`,
        `Timing: ${timingLabel(d.timing)}`,
        `Phone: ${d.phone}`,
      ].join("\n"),
    });
    return { ok: true };
  } catch (err) {
    console.error("submitExpertLead failed:", err);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Contact form → a tagged contact in GoHighLevel, topic + message as custom fields. */
export async function submitContactLead(input: unknown): Promise<LeadResult> {
  if (honeypotFilled(input)) return { ok: true };
  if (!rateLimit(`contact:${await clientIp()}`)) return { ok: false, error: RATE_LIMITED };

  const parsed = contactLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form and try again." };
  const d = parsed.data;

  try {
    await createGhlContact({
      firstName: d.firstName,
      email: d.email,
      source: "Website — Contact",
      tags: ["contact-form", `topic:${d.topic}`],
      // Custom fields (not a note) so the GHL notification workflow can merge
      // them into the email to hello@. Keys must match the GHL custom fields.
      customFields: [
        { key: "enquiry_topic", value: topicLabel(d.topic) },
        { key: "contact_form_message", value: d.message },
      ],
    });
    return { ok: true };
  } catch (err) {
    console.error("submitContactLead failed:", err);
    return { ok: false, error: GENERIC_ERROR };
  }
}
