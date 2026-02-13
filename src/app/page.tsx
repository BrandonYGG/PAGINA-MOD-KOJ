'use client';

import dynamic from 'next/dynamic';
import Footer from '@/components/layout/footer';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import Services from '@/components/sections/services';
import WhyChooseUs from '@/components/sections/why-choose-us';
import Standards from '@/components/sections/contact';
import { Skeleton } from '@/components/ui/skeleton';
import Coverage from '@/components/sections/coverage';

const Header = dynamic(() => import('@/components/layout/header'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-20" />,
});

const Projects = dynamic(() => import('@/components/sections/projects'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-64" />,
});


export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <WhyChooseUs />
        <Coverage />
        <Projects />
        <Standards />
      </main>
      <Footer />
    </div>
  );
}
