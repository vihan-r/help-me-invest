import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require an authenticated user. Everything else stays public; the
// education content gating is enforced in-page (see /education/wholesale) so that
// the free Module 01 stays reachable while the rest is gated.
const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next internals, the embedded Sanity Studio
    // (it manages its own auth), and static files...
    "/((?!_next|studio|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // ...and always on API routes.
    "/(api|trpc)(.*)",
  ],
};
