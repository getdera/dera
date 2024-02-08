'use client';

import Link from 'next/link';

import { Button, MantineSize } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';

interface Props {
  size?: MantineSize;
  href: string;
}
export const GetInTouchButton = ({ size, href }: Props) => {
  return (
    <Button
      size={size}
      component={Link}
      href={href}
      rightSection={<IconArrowNarrowRight />}
    >
      Get In Touch
    </Button>
  );
};
