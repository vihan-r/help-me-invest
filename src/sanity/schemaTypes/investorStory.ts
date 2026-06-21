import { defineField, defineType } from "sanity";

/**
 * An investor story — the cards shown on the Investor Stories page. Fields match
 * exactly what each card renders today (name composed from first name + age +
 * location, a structural line, a summary, and an optional portrait). The full
 * story body + detail-page slug are intentionally deferred until we build the
 * detail pages (P3.3).
 */
export const investorStory = defineType({
  name: "investorStory",
  title: "Investor story",
  type: "document",
  fields: [
    defineField({
      name: "firstName",
      title: "First name",
      type: "string",
      description: 'The investor’s first name, e.g. "Sarah".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "age",
      title: "Age",
      type: "number",
      description: 'Optional. Shown after the name, e.g. "Sarah, 31".',
      validation: (rule) => rule.min(18).max(120),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: 'Where they’re based, e.g. "Newcastle" or "Western Sydney".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "structuralLine",
      title: "Structural line",
      type: "string",
      description: 'The small grey line under the name, e.g. "First investment property · 2025."',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 5,
      description: "The story shown on the card.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      description: "Optional editorial portrait. Leave empty to show the placeholder frame.",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Controls the order on the Investor Stories page (lower numbers appear first).",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { firstName: "firstName", age: "age", location: "location", media: "portrait" },
    prepare({ firstName, age, location, media }) {
      const title = [firstName, age, location]
        .filter((v) => v !== undefined && v !== "")
        .join(", ");
      return { title, media };
    },
  },
});
