'use client';

import { UserButton } from '@clerk/nextjs';
import { AppShell, Box, Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Image from 'next/image';
import Sidebar from '../../components/sidebar/sidebar';
import Link from 'next/link';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 48 }}
      navbar={{
        width: 288,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p={5}>
        <Group justify="space-between">
          <Link href="/">
            <Box
              component={Image}
              src="/icon.png"
              alt="Logo"
              width={32}
              height={32}
              visibleFrom="sm"
            />
          </Link>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <UserButton afterSignOutUrl="/" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container fluid>{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
