import type { SchemaTypeDefinition } from "sanity";

import { educationTopic } from "./educationTopic";
import { investorStory } from "./investorStory";
import { videoModule } from "./videoModule";

/**
 * Registered content schemas for the Studio.
 *
 *   - P3.2 (here): investorStory, educationTopic, videoModule (+ seed content)
 *   - P3.4: landingPage + the brand-enforced page-builder block types
 */
export const schemaTypes: SchemaTypeDefinition[] = [investorStory, educationTopic, videoModule];
