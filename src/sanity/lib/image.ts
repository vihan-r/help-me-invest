import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Build a CDN URL for a Sanity image (e.g. `urlForImage(portrait).width(800).url()`). */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
