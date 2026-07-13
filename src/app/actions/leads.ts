"use server";

import { createGhlContact } from "@/lib/ghl";
import {
  contactLeadSchema,
  expertLeadSchema,
  intentLabel,
  timingLabel,
  topicLabel,
} from "@/lib/leadSchemas";

export type LeadResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR =
  "Something went wrong sending this. Please try again in a moment, or email hello@helpmeinvest.com.au.";

/** Talk-to-an-expert intake → a tagged contact in GoHighLevel. */
export async function submitExpertLead(input: unknown): Promise<LeadResult> {
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

/** Contact form → a tagged contact in GoHighLevel, message attached as a note. */
export async function submitContactLead(input: unknown): Promise<LeadResult> {
  const parsed = contactLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form and try again." };
  const d = parsed.data;

  try {
    await createGhlContact({
      firstName: d.firstName,
      email: d.email,
      source: "Website — Contact",
      tags: ["contact-form", `topic:${d.topic}`],
      note: ["Contact form", `Topic: ${topicLabel(d.topic)}`, "", d.message].join("\n"),
    });
    return { ok: true };
  } catch (err) {
    console.error("submitContactLead failed:", err);
    return { ok: false, error: GENERIC_ERROR };
  }
}
