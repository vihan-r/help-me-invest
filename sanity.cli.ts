import { defineCliConfig } from "sanity/cli";

/**
 * Sanity CLI config — used for local CLI tasks like the P3.2 content import
 * (`npx sanity dataset import`). The CLI authenticates with your own
 * `npx sanity login` session, so no token is needed.
 *
 * `projectId` is public (it already ships in the client bundle and the embedded
 * Studio), so it's safe to commit here. The running app still reads projectId /
 * dataset from env — this config only drives the CLI.
 */
export default defineCliConfig({
  api: {
    projectId: "4sn52e0z",
    dataset: "production",
  },
});
