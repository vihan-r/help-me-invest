import { defineField, defineType } from "sanity";

/**
 * A video module within an education topic. Fields match what the module rows /
 * hero render today (title, number, duration, optional blurb) plus an editable
 * access level that models the current "Module 01 free, rest gated" rule.
 *
 * The actual video source is deliberately NOT here yet — that arrives with
 * Cloudflare Stream in P4, so a module currently has a duration but no video.
 */
export const videoModule = defineType({
  name: "videoModule",
  title: "Video module",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "reference",
      to: [{ type: "educationTopic" }],
      description: "Which education topic this module belongs to.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "moduleNumber",
      title: "Module number",
      type: "number",
      description: 'Position in the series, e.g. 1 for "Module 01".',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: 'e.g. "08:24".',
    }),
    defineField({
      name: "blurb",
      title: "Blurb",
      type: "text",
      rows: 3,
      description:
        "Short description shown in the module list. (Module 01 is the hero video, so it may have no blurb.)",
    }),
    defineField({
      name: "accessLevel",
      title: "Access level",
      type: "string",
      description:
        'Who can watch. "Free" is open to everyone; "Account required" is gated behind sign-in.',
      options: {
        list: [
          { title: "Free", value: "free" },
          { title: "Account required", value: "account" },
        ],
        layout: "radio",
      },
      initialValue: "account",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Module number",
      name: "moduleNumberAsc",
      by: [{ field: "moduleNumber", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", moduleNumber: "moduleNumber", topicTitle: "topic.title" },
    prepare({ title, moduleNumber, topicTitle }) {
      const num = moduleNumber ? String(moduleNumber).padStart(2, "0") : "??";
      return { title: `Module ${num} · ${title}`, subtitle: topicTitle };
    },
  },
});
