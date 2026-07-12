import { z } from "zod";

/**
 * Lead-form option sets + zod schemas, shared by the client forms (labels +
 * validation) and the server actions (validation + label lookup for GHL notes).
 * Single source of truth so the form and the backend never drift.
 */

export const INTENTS = [
  { value: "first", label: "I’m buying my first investment property." },
  { value: "next", label: "I’m buying my next investment property." },
  { value: "refinance", label: "I’m refinancing an existing loan." },
  { value: "review", label: "I’m reviewing my current portfolio." },
  { value: "other", label: "Something else — I’ll explain below." },
] as const;

export const TIMINGS = [
  { value: "week", label: "This week." },
  { value: "month", label: "This month." },
  { value: "quarter", label: "Sometime in the next quarter." },
  { value: "exploring", label: "I’m just exploring, no rush." },
] as const;

export const TOPICS = [
  { value: "new", label: "I’m new, where do I start?" },
  { value: "property", label: "A question about a specific property or decision" },
  { value: "partner", label: "Partner enquiry" },
  { value: "press", label: "Press / other" },
] as const;

export const expertLeadSchema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name."),
  phone: z.string().trim().min(1, "Add a number we can reach you on."),
  email: z.email("Please add a valid email."),
  intent: z.enum(["first", "next", "refinance", "review", "other"]),
  timing: z.enum(["week", "month", "quarter", "exploring"]),
});

export const contactLeadSchema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name."),
  email: z.email("Please add a valid email."),
  topic: z.enum(["new", "property", "partner", "press"]),
  message: z.string().trim().min(1, "Add a short message so we can help."),
});

export type ExpertLead = z.infer<typeof expertLeadSchema>;
export type ContactLead = z.infer<typeof contactLeadSchema>;

const labelOf = (opts: readonly { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

export const intentLabel = (v: string) => labelOf(INTENTS, v);
export const timingLabel = (v: string) => labelOf(TIMINGS, v);
export const topicLabel = (v: string) => labelOf(TOPICS, v);
