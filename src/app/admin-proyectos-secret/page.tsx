'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AdminPage() {
  // Estados para Proyectos (Fotos)
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [infografias, setInfografias] = useState<FileList | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  
  // Estados para Videos
  const [videoTitulo, setVideoTitulo] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumb, setVideoThumb] = useState<File | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetchProyectos();
    fetchVideos();
  }, []);

  async function fetchProyectos() {
    const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
    if (data) setProyectos(data);
  }

  async function fetchVideos() {
    const { data } = await supabase.from('videos_proyectos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  }

  // Lógica para Publicar Proyectos (Fotos)
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !miniatura) return alert("Nombre y miniatura son obligatorios");
    setCargando(true);

    try {
      const miniaturaName = `${Date.now()}_thumb_${miniatura.name}`;
      const { error: thumbError } = await supabase.storage.from('galeria').upload(miniaturaName, miniatura);
      if (thumbError) throw new Error(`Error en Miniatura: ${thumbError.message}`);

      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(miniaturaName);

      const infoUrls = [];
      if (infografias) {
        for (let i = 0; i < infografias.length; i++) {
          const file = infografias[i];
          const fileName = `${Date.now()}_info_${file.name}`;
          const { error: infoError } = await supabase.storage.from('galeria').upload(fileName, file);
          if (infoError) throw new Error(`Error en Galería: ${infoError.message}`);
          const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
          infoUrls.push(data.publicUrl);
        }
      }

      const { error: dbError } = await supabase.from('proyectos').insert([
        { nombre, descripcion, miniatura_url: thumbData.publicUrl, infografias: infoUrls }
      ]);

      if (dbError) throw dbError;
      alert("¡Proyecto publicado con éxito!");
      setNombre(''); setDescripcion(''); 
      fetchProyectos();
    } catch (err: any) {
      alert(err.message || "Error al publicar");
    } finally {
      setCargando(false);
    }
  };

  // Lógica para Publicar Videos
  const handlePublicarVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitulo || !videoUrl || !videoThumb) return alert("Todos los campos del video son obligatorios");
    setCargando(true);

    try {
      const thumbName = `${Date.now()}_vthumb_${videoThumb.name}`;
      const { error: uploadError } = await supabase.storage.from('galeria').upload(thumbName, videoThumb);
      if (uploadError) throw uploadError;

      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(thumbName);

      const { error: dbError } = await supabase.from('videos_proyectos').insert([
        { titulo: videoTitulo, youtube_url: videoUrl, url_miniatura: thumbData.publicUrl }
      ]);

      if (dbError) throw dbError;

      alert("¡Video publicado con éxito!");
      setVideoTitulo(''); setVideoUrl('');
      fetchVideos();
    } catch (err: any) {
      alert("Error al subir video: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    try {
      const filesToDelete = [thumbUrl.split('/').pop()!];
      if (infoUrls) infoUrls.forEach(url => filesToDelete.push(url.split('/').pop()!));
      await supabase.storage.from('galeria').remove(filesToDelete);
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    } catch (err) { alert("Error al eliminar"); }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm("¿Eliminar este video?")) return;
    try {
      const fileName = thumbUrl.split('/').pop()!;
      await supabase.storage.from('galeria').remove([fileName]);
      await supabase.from('videos_proyectos').delete().eq('id', id);
      fetchVideos();
    } catch (err) { alert("Error al eliminar video"); }
  };

  return (
    <div className="p-8 bg-[#1a1c18] min-h-screen text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10 border-b border-[#7c8d74] pb-4">
          <h1 className="text-2xl font-light tracking-widest uppercase text-[#7c8d74]">
            Panel <span className="font-bold text-white">Admin</span>
          </h1>
          <span className="text-xs text-zinc-500 uppercase tracking-tighter">Construcciones Avanzadas KOH</span>
        </header>

        <div className="grid grid-cols-1 gap-16">
          
          {/* SECCIÓN 1: PROYECTOS (FOTOS) */}
          <section>
            <h2 className="text-[#7c8d74] font-bold mb-4 uppercase tracking-widest text-sm">Cargar Proyectos Fotográficos</h2>
            <form onSubmit={handlePublicar} className="bg-[#242622] p-8 rounded-sm shadow-2xl border-l-4 border-[#4a3424]">
              <div className="grid gap-6">
                <input type="text" placeholder="NOMBRE DEL PROYECTO" 
                  className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none transition-colors" 
                  value={nombre} onChange={e => setNombre(e.target.value)} />
                
                <textarea placeholder="DESCRIPCIÓN TÉCNICA" rows={3}
                  className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none transition-colors"
                  value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-zinc-800">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#7c8d74]">IMAGEN PRINCIPAL</label>
                    <input type="file" accept="image/*" className="text-sm cursor-pointer" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#7c8d74]">GALERÍA (INFOGRAFÍAS)</label>
                    <input type="file" multiple accept="image/*" className="text-sm cursor-pointer" onChange={e => setInfografias(e.target.files)} />
                  </div>
                </div>

                <button disabled={cargando} className="bg-[#4a3424] hover:bg-[#5d432d] text-white py-4 px-8 tracking-widest font-bold transition-all disabled:opacity-50 uppercase text-sm">
                  {cargando ? 'PROCESANDO...' : 'PUBLICAR PROYECTO FOTO'}
                </button>
              </div>
            </form>
          </section>

          {/* SECCIÓN 2: VIDEOS */}
          <section>
            <h2 className="text-[#7c8d74] font-bold mb-4 uppercase tracking-widest text-sm">Cargar Video de YouTube</h2>
            <form onSubmit={handlePublicarVideo} className="bg-[#242622] p-8 rounded-sm shadow-2xl border-l-4 border-red-900">
              <div className="grid gap-6">
                <input type="text" placeholder="TÍTULO DEL VIDEO" 
                  className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none transition-colors text-white" 
                  value={videoTitulo} onChange={e => setVideoTitulo(e.target.value)} />
                
                <input type="url" placeholder="URL DE YOUTUBE (https://...)" 
                  className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none transition-colors text-white" 
                  value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                
                <div className="flex flex-col gap-2 py-4 border-y border-zinc-800">
                  <label className="text-xs font-bold text-[#7c8d74]">SUBIR MINIATURA DEL VIDEO</label>
                  <input type="file" accept="image/*" className="text-sm cursor-pointer" onChange={e => setVideoThumb(e.target.files?.[0] || null)} />
                </div>

                <button disabled={cargando} className="bg-red-900 hover:bg-red-800 text-white py-4 px-8 tracking-widest font-bold transition-all disabled:opacity-50 uppercase text-sm">
                  {cargando ? 'SUBIENDO...' : 'PUBLICAR VIDEO'}
                </button>
              </div>
            </form>
          </section>

          {/* LISTADOS DE CONTROL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-bold mb-6 text-zinc-400">FOTOS ACTIVAS</h2>
              <div className="grid gap-2">
                {proyectos.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-[#242622] p-4 border border-zinc-800 text-sm">
                    <span className="truncate mr-4">{p.nombre}</span>
                    <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} className="text-red-500 hover:text-red-300 font-bold uppercase text-[10px]">Borrar</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 text-zinc-400">VIDEOS ACTIVOS</h2>
              <div className="grid gap-2">
                {videos.map(v => (
                  <div key={v.id} className="flex justify-between items-center bg-[#242622] p-4 border border-zinc-800 text-sm">
                    <span className="truncate mr-4">{v.titulo}</span>
                    <button onClick={() => handleBorrarVideo(v.id, v.url_miniatura)} className="text-red-500 hover:text-red-300 font-bold uppercase text-[10px]">Borrar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}