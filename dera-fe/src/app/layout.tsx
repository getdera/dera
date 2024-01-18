import type { Metadata } from 'next';
// Trying a suggestion from https://github.com/vercel/next.js/issues/16630#issuecomment-710752297
// to workaround css ordering issue that causes some components to not render correctly. Not sure if it works though.
// The suggestion is to load all css in a single css and to import that css in the entry point.
import './style.css';
import { Notifications } from '@mantine/notifications';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ClerkProvider } from '@clerk/nextjs';

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
    <ClerkProvider>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body>
          <MantineProvider>
            <Notifications />
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
