import { defineField, defineType } from "sanity";

/**
 * A video module within an education topic. Fields match what the module rows /
 * hero render today (title, number, duration, optional blurb) plus an editable
 * access level that models the current "Module 01 free, rest gated" rule and the
 * Cloudflare Stream video UID (P4).
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
      name: "cloudflareVideoId",
      title: "Cloudflare video ID",
      type: "string",
      description:
        "The video's UID from the Cloudflare Stream dashboard. For account-gated modules, turn on “Require signed URLs” on the video in Cloudflare. Leave empty until the video is uploaded.",
    }),
    defineField({
      name: "previewImage",
      title: "Preview image",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional public still shown on the module list — and blurred behind the sign-up wall for gated modules. A marketing-chosen frame, NOT the protected video thumbnail (that stays locked to signed-in viewers). Leave empty for a plain placeholder.",
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
