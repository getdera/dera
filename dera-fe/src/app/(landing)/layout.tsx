'use client';

import { LandingNavbar } from '@/app/(landing)/landing-navbar';
import { domain } from '@/lib/constants';
import { Anchor, AppShell, Box, Container, Group, Text } from '@mantine/core';
import React from 'react';

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppShell header={{ height: 68 }} padding="md">
      <AppShell.Header>
        <LandingNavbar />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">{children}</Container>
      </AppShell.Main>

      <Box py="xs">
        <Container size="lg">
          <Group justify="space-between">
            <Text c="dimmed">
              Copyright © {new Date().getFullYear()} {domain}
            </Text>

            <Anchor href="/terms" target="_blank">
              Terms of Use
            </Anchor>
          </Group>
        </Container>
      </Box>
    </AppShell>
    // <main className="h-full overflow-auto">
    //   <div className="mx-auto max-w-screen-xl h-full">{children}</div>
    // </main>
  );
};

export default LandingLayout;
