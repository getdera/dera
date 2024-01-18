import type { Metadata } from 'next';
// Trying a suggestion from https://github.com/vercel/next.js/issues/16630#issuecomment-710752297
// to workaround css ordering issue that causes some components to not render correctly. Not sure if it works though.
// The suggestion is to load all css in a single css and to import that css in the entry point.
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import './style.css';

export const metadata: Metadata = {
  title: 'Dera',
  description: 'Data Encoding and Representation Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <head>
          <ColorSchemeScript forceColorScheme="dark" />
        </head>
        <body>
          <MantineProvider forceColorScheme="dark">
            <Notifications />
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
