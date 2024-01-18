'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

import { Button } from '@mantine/core';

export const GetStartedButton = () => {
  const { isSignedIn } = useAuth();

  return (
    <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
      <Button className="rounded-full">Get Started</Button>
    </Link>
  );
};
