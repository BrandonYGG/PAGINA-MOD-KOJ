'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Eye, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Nota: He quitado el import de projectsData para que no te marque error de archivo no usado

interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  miniatura_url: string;
  infografias: string[];
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllProjects() {
      try {
        setLoading(true);
        // 1. Traemos SOLO los proyectos de Supabase
        const { data: nube, error } = await supabase
          .from('proyectos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Seteamos solo lo que viene de la nube
        setProjects(nube || []);
      } catch (err) {
        console.error("Error al cargar proyectos de Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllProjects();
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 3));
  };

  useEffect(() => {
    setZoom(1);
  }, [selectedProject]);

  if (loading) return (
    <div className="py-24 flex justify-center bg-secondary">
      <Loader2 className="h-8 w-8 animate-spin text-[#7c8d74]" />
    </div>
  );

  return (
    <section id="projects" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary uppercase">
            Nuestros Proyectos
          </h2>
        </div>

        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedProject(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {projects.length > 0 ? (
              projects.map((project) => (
                <DialogTrigger asChild key={project.id} onClick={() => setSelectedProject(project)}>
                  <div className="block group cursor-pointer">
                    <Card className="overflow-hidden border-none shadow-lg h-full flex flex-col bg-[#242622]">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={project.miniatura_url}
                          alt={project.nombre}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-[#7c8d74] text-base uppercase tracking-wider">{project.nombre}</CardTitle>
                        <CardDescription className="text-zinc-400 text-xs line-clamp-2">{project.descripcion}</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </DialogTrigger>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-zinc-500">
                No hay proyectos disponibles en la base de datos.
              </div>
            )}
          </div>

          {selectedProject && (
            <DialogContent className="max-w-5xl w-full h-[90dvh] bg-[#1a1c18] border-zinc-800 text-white flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-[#7c8d74] font-headline uppercase">{selectedProject.nombre}</DialogTitle>
                <DialogDescription className="text-zinc-400">{selectedProject.descripcion}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow mt-4">
                <Carousel className="w-full">
                  <CarouselContent>
                    {selectedProject.infografias && selectedProject.infografias.length > 0 ? (
                      selectedProject.infografias.map((img, i) => (
                        <CarouselItem key={i}>
                          <div onWheel={handleWheel} className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s' }} className="relative w-full h-full">
                              <Image 
                                src={img} 
                                alt={`Vista ${i + 1}`} 
                                fill 
                                className="object-contain" 
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="aspect-video w-full flex items-center justify-center bg-zinc-900 rounded-lg">
                          <p className="text-zinc-500 italic">Este proyecto no tiene infografías adicionales.</p>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 bg-black/50" />
                  <CarouselNext className="right-2 bg-black/50" />
                </Carousel>
              </ScrollArea>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </section>
  );
}