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
import VideoGallery from '@/components/sections/video-gallery'; // Importación de la nueva sección

// Componentes con carga dinámica
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
      {/* Encabezado dinámico */}
      <Header />
      
      <main className="flex-1">
        {/* Sección principal de impacto */}
        <Hero />
        
        {/* Información de la empresa */}
        <About />
        
        {/* Catálogo de servicios profesionales */}
        <Services />
        
        {/* Diferenciadores y beneficios */}
        <WhyChooseUs />
        
        {/* Cobertura nacional e internacional */}
        <Coverage />
        
        {/* Galería de proyectos (Fotos) */}
        <Projects />

        {/* Nueva Sección: Proyectos en Video */}
        <VideoGallery />
        
        {/* Formulario de contacto y estándares */}
        <Standards />
      </main>

      {/* Pie de página corregido */}
      <Footer />
    </div>
  );
}