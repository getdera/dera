'use client';

import { Montserrat } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { GetStartedButton } from './get-started-button';

const font = Montserrat({ weight: '600', subsets: ['latin'] });

export const LandingNavbar = () => {
  return (
    <nav className="p-4 bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-8 w-8 mr-4">
          <Image fill alt="Logo" src="/logo.svg" />
        </div>
        <h1 className={cn('text-2xl font-bold', font.className)}>Dera</h1>
      </Link>
      <div className="flex items-center gap-x-2">
        <GetStartedButton />
      </div>
    </nav>
  );
};
