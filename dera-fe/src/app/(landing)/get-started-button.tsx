'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

import { Button, MantineSize } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';

interface Props {
  size?: MantineSize;
}
export const GetStartedButton = ({ size }: Props) => {
  const { isSignedIn } = useAuth();

  return (
    <Button
      size={size}
      component={Link}
      href={isSignedIn ? '/dashboard' : '/sign-up'}
      rightSection={<IconArrowNarrowRight />}
    >
      Get Started
    </Button>
  );
};
