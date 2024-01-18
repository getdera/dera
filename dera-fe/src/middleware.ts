import Clerk from '@clerk/clerk-sdk-node';
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: ['/'],
  afterAuth: async (auth, req) => {
    // Allow users visiting public routes to access them
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Handle users who aren't authenticated
    if (!auth.userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    const userHasOrg = !!(
      await Clerk.users.getOrganizationMembershipList({
        userId: auth.userId,
      })
    ).length;

    // If the user doesn't have an organization, redirect them to the dashboard where we will
    // redirect to the Create Organization page to prompt them to create an org.
    if (!userHasOrg && req.nextUrl.pathname !== '/dashboard') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
