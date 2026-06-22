import type { SanityImageSource } from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/react";

// ---- Investor stories -------------------------------------------------------

export interface StoryCard {
  _id: string;
  firstName: string;
  age?: number;
  location: string;
  structuralLine: string;
  summary: string;
  slug: string;
  portrait?: SanityImageSource | null;
}

export interface StoryDetail extends StoryCard {
  body?: PortableTextBlock[] | null;
}

export const STORIES_QUERY = `*[_type == "investorStory"] | order(order asc){
  _id, firstName, age, location, structuralLine, summary, "slug": slug.current, portrait
}`;

export const STORY_SLUGS_QUERY = `*[_type == "investorStory" && defined(slug.current)]{
  "slug": slug.current
}`;

export const STORY_BY_SLUG_QUERY = `*[_type == "investorStory" && slug.current == $slug][0]{
  _id, firstName, age, location, structuralLine, summary, body, "slug": slug.current, portrait
}`;

// ---- Education --------------------------------------------------------------

export interface TopicCard {
  _id: string;
  title: string;
  slug: string;
  hubBlurb: string;
  moduleCountLine?: string;
  thumbnailDuration?: string;
}

export interface TopicPage {
  title: string;
  slug: string;
  eyebrow?: string;
  pageHeadline?: string;
  intro?: string;
}

export interface Module {
  _id: string;
  title: string;
  moduleNumber: number;
  duration?: string;
  blurb?: string;
  accessLevel: "free" | "account";
}

export const TOPICS_QUERY = `*[_type == "educationTopic"] | order(order asc){
  _id, title, "slug": slug.current, hubBlurb, moduleCountLine, thumbnailDuration
}`;

export const TOPIC_BY_SLUG_QUERY = `*[_type == "educationTopic" && slug.current == $slug][0]{
  title, "slug": slug.current, eyebrow, pageHeadline, intro
}`;

export const MODULES_BY_TOPIC_QUERY = `*[_type == "videoModule" && topic->slug.current == $slug] | order(moduleNumber asc){
  _id, title, moduleNumber, duration, blurb, accessLevel
}`;
