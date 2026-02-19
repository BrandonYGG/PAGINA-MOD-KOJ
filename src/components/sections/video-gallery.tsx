import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos_proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setVideos(data);
    };
    fetchVideos();
  }, []);

  return (
    <section id="videos" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TÍTULO ACTUALIZADO: ENFOQUE EN CONCEPTO Y DESARROLLO */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
            Desarrollo y <span className="text-red-600">Concepto Editorial</span>
          </h2>
          <div className="w-24 h-2 bg-red-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-slate-600 font-medium max-w-xl mx-auto italic">
            Nuestra metodología visual: la evolución de cada proyecto desde su concepción hasta el diseño final.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {videos.map((video) => (
            <a 
              key={video.id} 
              href={video.youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative block bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
            >
              {/* Imagen con object-contain para respetar el formato original */}
              <div className="relative aspect-video bg-slate-200 overflow-hidden">
                <img 
                  src={video.url_miniatura} 
                  alt={video.titulo}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-500 group-hover:scale-110">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-800 uppercase group-hover:text-red-600 transition-colors">
                  {video.titulo}
                </h3>
                <div className="mt-3 flex items-center text-red-600 font-bold text-sm">
                  REPRODUCIR CONCEPTO 
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;