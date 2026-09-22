import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define routes that DO NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',                    // Landing page
  '/sign-in(.*)',         // Sign-in page
  '/sign-up(.*)',         // Sign-up page
  '/api/webhooks(.*)',    // Webhook endpoints
])

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that are NOT public
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}