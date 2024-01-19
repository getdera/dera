'use client';

import { LandingNavbar } from '@/app/(landing)/landing-navbar';
import { AppShell, Container } from '@mantine/core';
import React from 'react';

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppShell header={{ height: 68 }} padding="md">
      <AppShell.Header>
        <LandingNavbar />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">{children}</Container>
      </AppShell.Main>
    </AppShell>
    // <main className="h-full overflow-auto">
    //   <div className="mx-auto max-w-screen-xl h-full">{children}</div>
    // </main>
  );
};

export default LandingLayout;
