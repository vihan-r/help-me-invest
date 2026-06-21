import { defineField, defineType } from "sanity";

/**
 * An education topic — the series shown on the Education hub (Wholesale, Finance,
 * Property strategy). The "Hub card" group holds what appears on /education; the
 * "Topic page" group holds the per-topic page header (only Wholesale has a real
 * page today, so those fields are optional and left empty for the stubs).
 */
export const educationTopic = defineType({
  name: "educationTopic",
  title: "Education topic",
  type: "document",
  groups: [
    { name: "hub", title: "Hub card", default: true },
    { name: "page", title: "Topic page" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Understanding wholesale property."',
      group: ["hub", "page"],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: 'The URL segment, e.g. "wholesale" → /education/wholesale.',
      options: { source: "title", maxLength: 96 },
      group: "hub",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hubBlurb",
      title: "Hub blurb",
      type: "text",
      rows: 3,
      description: "The description shown under the title on the Education hub.",
      group: "hub",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "moduleCountLine",
      title: "Module count line",
      type: "string",
      description: 'Free text shown on the hub, e.g. "8 modules · ~90 minutes of video."',
      group: "hub",
    }),
    defineField({
      name: "thumbnailDuration",
      title: "Thumbnail duration",
      type: "string",
      description: 'Duration on the hub thumbnail badge, e.g. "08:24".',
      group: "hub",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Controls the order of topics on the Education hub (lower numbers first).",
      group: "hub",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description:
        'Small label at the top of the topic page, e.g. "Education · Understanding wholesale property". Leave empty for topics that don’t have a built page yet.',
      group: "page",
    }),
    defineField({
      name: "pageHeadline",
      title: "Page headline",
      type: "string",
      description: 'The headline on the topic page, e.g. "What wholesale actually means."',
      group: "page",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 5,
      description: "The opening paragraph on the topic page.",
      group: "page",
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
    select: { title: "title", subtitle: "moduleCountLine" },
  },
});
