'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navLinks = [
  { href: '#about', label: 'Quiénes Somos' },
  { href: '#services', label: 'Servicios' },
  { href: '#why-us', label: 'Por Qué Elegirnos' },
  { href: '#coverage', label: 'Cobertura' },
  { href: '#projects', label: 'Nuestros Proyectos' },
  { href: '#standards', label: 'Estándares' },
];

const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 bg-background/80 backdrop-blur-sm shadow-md'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        
        {/* Logo principal */}
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <Image
            src="/logoKOH.jpg"
            alt="Construcciones Avanzadas KOH Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            priority
          />
          <span className="text-xl font-bold font-headline text-primary">
            Construcciones Avanzadas KOH
          </span>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Menú móvil */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                
                {/* Logo en menú móvil */}
                <Link
                  href="#"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  prefetch={false}
                >
                  <Image
                    src="/logoKOH.jpg"
                    alt="Construcciones Avanzadas KOH Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    priority
                  />
                  <span className="text-xl font-bold font-headline">
                    Construcciones Avanzadas KOH
                  </span>
                </Link>

                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
