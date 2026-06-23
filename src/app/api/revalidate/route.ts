import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { sanityFetch } from "@/sanity/lib/fetch";
import { STORY_SLUGS_QUERY } from "@/sanity/lib/queries";

/**
 * Sanity publish webhook → on-demand revalidation. Sanity POSTs here on every
 * content change; we verify the HMAC signature against `SANITY_REVALIDATE_SECRET`
 * (so only Sanity can trigger it), then revalidate the routes that read the
 * changed document type. The webhook must send a payload that includes `_type`.
 *
 * Story detail pages are prerendered via `generateStaticParams`, so they must be
 * revalidated by their CONCRETE paths (`/stories/sarah`) — the dynamic-pattern
 * form (`/stories/[slug]`) does not reliably revalidate prerendered pages.
 */
async function revalidateForType(type: string): Promise<string[]> {
  switch (type) {
    case "investorStory": {
      revalidatePath("/success-stories");
      const slugs = await sanityFetch<{ slug: string }[]>(STORY_SLUGS_QUERY);
      const storyPaths = slugs.map(({ slug }) => `/stories/${slug}`);
      storyPaths.forEach((path) => revalidatePath(path));
      return ["/success-stories", ...storyPaths];
    }
    case "educationTopic":
      revalidatePath("/education");
      revalidatePath("/education/wholesale");
      return ["/education", "/education/wholesale"];
    case "videoModule":
      revalidatePath("/education/wholesale");
      return ["/education/wholesale"];
    default:
      return [];
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse("Missing SANITY_REVALIDATE_SECRET", { status: 500 });
  }

  const signature = req.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  const body = await req.text();

  if (!(await isValidSignature(body, signature, secret))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let type: string | undefined;
  try {
    type = (JSON.parse(body) as { _type?: string })._type;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const revalidated = type ? await revalidateForType(type) : [];
  if (revalidated.length === 0) {
    return NextResponse.json({ revalidated: false, reason: "no routes for type", type });
  }

  return NextResponse.json({ revalidated: true, type, paths: revalidated });
}
