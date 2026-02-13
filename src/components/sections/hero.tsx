import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function Hero() {
  const heroImageUrl = 'https://scontent.fmex3-2.fna.fbcdn.net/v/t39.30808-6/444151191_344706598718704_7192519367703420718_n.png?_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeGMaAGu4H6sBnGo6vq_eKW8_fMcTuzbRzr98xxO7NtHOvYsj-3u7Ch7j8wM6I_y8IaOcIdYpgXqS28pZ1hTge09&_nc_ohc=WXIT9Tt__UkQ7kNvwGJqsUE&_nc_oc=AdkfLI1TDfeekOuX5fiBJ26bTN0U9pZgBz1ISSSixc5PwrX8bRdeKpHdZTt5vsnYHJJazgmGEeuU9OAFdH6WayKp&_nc_zt=23&_nc_ht=scontent.fmex3-2.fna&_nc_gid=PK-KIpZFkgRBq7U33-DhZQ&oh=00_AflIb3OXJ7z7qSNzQmnuDZ4i-9e8zl6VoMqBRZ9lqm7Khw&oe=693BE60C';

  return (
    <section 
      className="relative h-[80dvh] w-full flex items-center justify-center text-center text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImageUrl})` }}
    >
      <div className="absolute inset-0 bg-primary/70" />
      <div className="relative z-10 px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight animate-fade-in-up">
          Construyendo el futuro, hoy.
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90 animate-fade-in-up animation-delay-300">
          En Construcciones Avanzadas KOH, transformamos ideas en realidades. Calidad, confianza e innovación en cada proyecto.
        </p>
        <Link href="#services" className="mt-8 animate-fade-in-up animation-delay-600">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Nuestros Servicios
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
