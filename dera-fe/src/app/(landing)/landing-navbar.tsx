'use client';

import { Montserrat } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { ActionIcon, Group, NavLink } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { GetStartedButton } from './get-started-button';

const font = Montserrat({ weight: '600', subsets: ['latin'] });

export const LandingNavbar = () => {
  return (
    <Group p="md" justify="space-between">
      <Link href="/" className="flex items-center">
        <Group gap={4}>
          <Image alt="Logo" src="/icon.png" width={32} height={32} />
          <h1 className={cn('text-2xl font-bold', font.className)}>Dera</h1>
        </Group>
      </Link>
      <Group gap="xs">
        <NavLink
          href="#pricing"
          label="Pricing"
          w="auto"
          fw="bold"
          style={{ borderRadius: 8 }}
        />

        <ActionIcon
          component="a"
          variant="white"
          color="dark"
          size="lg"
          radius={999}
          href="https://github.com/getdera/dera"
          target="_blank"
          visibleFrom="xs"
        >
          <IconBrandGithub />
        </ActionIcon>
        <GetStartedButton />
      </Group>
    </Group>
  );
};
