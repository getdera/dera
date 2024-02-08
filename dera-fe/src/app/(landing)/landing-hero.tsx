'use client';

import { Text, Title } from '@mantine/core';
import TypewriterComponent from 'typewriter-effect';
import { GetInTouchButton } from './get-in-touch-button';
import { GetStartedButton } from './get-started-button';

export const LandingHero = () => {
  return (
    <div className="font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
        <Title fz="inherit" my={0} fw="bolder">
          A Single Platform to
        </Title>
        <Text
          component="div"
          variant="gradient"
          fw="bolder"
          fz="inherit"
          gradient={{ from: 'violet', to: 'pink' }}
        >
          <TypewriterComponent
            options={{
              strings: [
                'Version Control Embeddings.',
                'Match Embeddings.',
                'Evaluate Results.',
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </Text>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-bold">
        Manage your embeddings and chunks with ease.
        <br />
        Compare and analyse results to build production-ready
        Retrieval-Augmented Generation (RAG) applications.
      </div>
      <div>
        {process.env.NEXT_PUBLIC_CLOSE_SIGNUPS === 'true' ? (
          <GetInTouchButton size="xl" href="#pricing" />
        ) : (
          <GetStartedButton size="xl" />
        )}
      </div>
    </div>
  );
};
