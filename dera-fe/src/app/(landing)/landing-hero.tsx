'use client';

import TypewriterComponent from 'typewriter-effect';
import { GetStartedButton } from './get-started-button';

export const LandingHero = () => {
  return (
    <div className="font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>A Single Platform to</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
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
        </div>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-bold">
        Manage your embeddings and chunks with ease.
        <br />
        Compare and analyse results to build production-ready
        Retrieval-Augmented Generation (RAG) applications.
      </div>
      <div>
        <GetStartedButton size="xl" />
      </div>
    </div>
  );
};
