'use client';

import { Play } from 'lucide-react';

// Estos datos luego los traeremos de Supabase, por ahora son para probar
const videoProjects = [
  {
    title: "Terracerías y Obra Civil",
    youtubeUrl: "https://www.youtube.com/watch?v=tu_video_1",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800", // Imagen de ejemplo
  },
  {
    title: "Diseño y Renderizado 3D",
    youtubeUrl: "https://www.youtube.com/watch?v=tu_video_2",
    thumbnail: "https://images.unsplash.com/photo-1503387762-5929b6a61d94?q=80&w=800",
  },
  {
    title: "Acabados Residenciales",
    youtubeUrl: "https://www.youtube.com/watch?v=tu_video_3",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
  }
];

export default function VideoGallery() {
  return (
    <section id="videos" className="py-20 bg-[#f9fafb]">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-[#2d4a3e] uppercase tracking-tight">
            Nuestros Proyectos en Movimiento
          </h2>
          <div className="h-1 w-20 bg-[#7c8d74] mx-auto mt-4"></div>
          <p className="mt-6 text-zinc-600 max-w-2xl mx-auto">
            Visualiza el proceso constructivo y los resultados finales de nuestras obras a través de nuestra galería de videos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoProjects.map((video, index) => (
            <a 
              key={index} 
              href={video.youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-500"
            >
              {/* Contenedor de Imagen/Miniatura */}
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay Oscuro al Hover */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300"></div>

                {/* Botón de Play Central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600 group-hover:border-red-600">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              </div>

              {/* Texto debajo del video */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-zinc-800 group-hover:text-[#2d4a3e] transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center mt-3 text-red-600 text-sm font-semibold">
                  <span>VER EN YOUTUBE</span>
                  <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}