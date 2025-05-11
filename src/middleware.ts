import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',    // Matches anything starting with "/sign-in"
  '/sign-up(.*)',    // Matches anything starting with "/sign-up"
  "/api/webhooks",   // Matches "/api/webhooks"
  "/",
  "/categories",
    "/products",
    "/products/(.*)", // Matches any product page
    "/cart",
])

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except the ones defined as public
  if (!isPublicRoute(req)) {
    await auth.protect() // Protect the route if it's not public
  }
})

// This matcher ensures Clerk middleware runs for API and TRPC routes, and skips unnecessary files
export const config = {
  matcher: [
    // Exclude Next.js internals and static assets from middleware processing
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', 
    
    // Always run Clerk middleware for API routes and TRPC routes
    '/(api|trpc)(.*)',
  ],
}