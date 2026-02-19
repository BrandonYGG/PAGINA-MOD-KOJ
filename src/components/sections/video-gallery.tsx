'use client';

import { useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
// IMPORTACIÓN CORREGIDA: Apunta a src/supabaseClient.ts
import { supabase } from '@/supabaseClient'; 

interface VideoProject {
  id: string;
  titulo: string;
  youtube_url: string;
  url_miniatura: string;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      // Intentamos traer los datos de la tabla 'videos_proyectos'
      const { data, error } = await supabase
        .from('videos_proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    }
    fetchVideos();
  }, []);

  // Si no hay videos en la base de datos, no mostramos la sección para que la web luzca limpia
  if (!loading && videos.length === 0) return null;

  return (
    <section id="videos" className="py-20 bg-[#f9fafb]">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-[#2d4a3e] uppercase tracking-tight">
            Nuestros Proyectos en Movimiento
          </h2>
          <div className="h-1 w-20 bg-[#7c8d74] mx-auto mt-4"></div>
          <p className="mt-6 text-zinc-600 max-w-2xl mx-auto">
            Visualiza el proceso constructivo y los resultados finales a través de nuestra galería de videos.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#7c8d74]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <a 
                key={video.id} 
                href={video.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-500"
              >
                {/* Contenedor de Imagen */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.url_miniatura} 
                    alt={video.titulo}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300"></div>
                  
                  {/* Icono de Play */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600 group-hover:border-red-600">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>

                {/* Info del Video */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-zinc-800 group-hover:text-[#2d4a3e] transition-colors">
                    {video.titulo}
                  </h3>
                  <div className="flex items-center mt-3 text-red-600 text-sm font-semibold">
                    <span>VER EN YOUTUBE</span>
                    <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}