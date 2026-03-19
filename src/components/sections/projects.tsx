'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/supabaseClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Eye, Loader2, Info } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  miniatura_url: string;
  infografias: string[];
  es_voluntario?: boolean;
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-[#7c8d74]" /></div>;

  return (
    <section id="projects" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Dialog onOpenChange={(open) => !open && setSelectedProject(null)}>
            {projects.map((project) => (
              <DialogTrigger asChild key={project.id} onClick={() => setSelectedProject(project)}>
                <Card className="cursor-pointer group bg-[#242622] border-none overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={project.miniatura_url} alt={project.nombre} fill className="object-cover transition group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"><Eye className="text-white" /></div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-[#7c8d74] text-sm uppercase">{project.nombre}</CardTitle>
                  </CardHeader>
                </Card>
              </DialogTrigger>
            ))}

            {selectedProject && (
              <DialogContent className="max-w-5xl w-full h-[90dvh] bg-[#1a1c18] border-zinc-800 text-white flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-[#7c8d74] uppercase">{selectedProject.nombre}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-grow pr-4">
                  {/* PÁRRAFO DE JUSTIFICACIÓN CONDICIONAL */}
                  {selectedProject.es_voluntario && (
                    <div className="mb-6 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Info size={14} />
                        <span className="font-bold text-[10px] uppercase">Nota Técnica de Apoyo Comunitario</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 italic leading-relaxed">
                        "Este proyecto y sus láminas descriptivas han sido desarrollados por nuestro equipo de trabajo 
                        y becarios con el fin de evidenciar trabajos reales propuestos como mejora gratuita para el 
                        entorno de nuestro país. Estas propuestas voluntarias buscan beneficiar a la comunidad y 
                        apoyar la titulación de estudiantes. La empresa se reserva el derecho de acordar la donación 
                        del proyecto técnico como apoyo a comunidades de alta densidad poblacional. Este sitio web 
                        funciona meramente como un currículum virtual para mostrar las capacidades y el alcance 
                        técnico de la empresa."
                      </p>
                    </div>
                  )}

                  <Carousel className="w-full">
                    <CarouselContent>
                      {selectedProject.infografias?.map((img, i) => (
                        <CarouselItem key={i}>
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/50">
                            <Image src={img} alt="Render" fill className="object-contain" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" /><CarouselNext className="right-2" />
                  </Carousel>
                </ScrollArea>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    </section>
  );
}