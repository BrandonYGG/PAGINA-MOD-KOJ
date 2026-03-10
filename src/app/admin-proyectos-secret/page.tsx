'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AdminPage() {
  // --- ESTADOS PARA PROYECTOS (FOTOS) ---
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [archivosOrdenados, setArchivosOrdenados] = useState<File[]>([]);

  // --- ESTADOS PARA VIDEOS ---
  const [videoTitulo, setVideoTitulo] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumb, setVideoThumb] = useState<File | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const [cargando, setCargando] = useState(false);

  // --- CARGA DE DATOS AL INICIAR ---
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

  // --- UTILIDADES ---
  // Reemplaza caracteres extraños, espacios y paréntesis por guiones bajos
  const cleanFileName = (name: string) => name.replace(/[^a-zA-Z0-9.]/g, '_');

  const moverArchivo = (index: number, direccion: 'izq' | 'der') => {
    const nuevosArchivos = [...archivosOrdenados];
    const file = nuevosArchivos.splice(index, 1)[0];
    const nuevaPos = direccion === 'izq' ? index - 1 : index + 1;
    nuevosArchivos.splice(nuevaPos, 0, file);
    setArchivosOrdenados(nuevosArchivos);
  };

  // --- LÓGICA DE PUBLICACIÓN ---
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !miniatura) return alert("Nombre y miniatura son obligatorios");
    setCargando(true);

    try {
      // 1. Subir Miniatura
      const miniaturaName = `${Date.now()}_thumb_${cleanFileName(miniatura.name)}`;
      const { error: thumbError } = await supabase.storage
        .from('galeria')
        .upload(miniaturaName, miniatura, { contentType: miniatura.type });
      
      if (thumbError) throw new Error(`Error en Miniatura: ${thumbError.message}`);
      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(miniaturaName);

      // 2. Subir Galería (Infografías)
      const infoUrls = [];
      if (archivosOrdenados.length > 0) {
        for (let i = 0; i < archivosOrdenados.length; i++) {
          const file = archivosOrdenados[i];
          const fileName = `${Date.now()}_info_${cleanFileName(file.name)}`;
          const { error: infoError } = await supabase.storage
            .from('galeria')
            .upload(fileName, file, { contentType: file.type });

          if (infoError) throw new Error(`Error en Galería: ${infoError.message}`);
          const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
          infoUrls.push(data.publicUrl);
        }
      }

      // 3. Insertar en DB
      const { error: dbError } = await supabase.from('proyectos').insert([
        { nombre, descripcion, miniatura_url: thumbData.publicUrl, infografias: infoUrls }
      ]);

      if (dbError) throw dbError;

      alert("¡Proyecto de KOH publicado con éxito!");
      setNombre(''); setDescripcion(''); setArchivosOrdenados([]); setMiniatura(null);
      fetchProyectos();
    } catch (err: any) {
      alert(err.message || "Error al publicar");
    } finally {
      setCargando(false);
    }
  };

  const handlePublicarVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitulo || !videoUrl || !videoThumb) return alert("Todos los campos del video son obligatorios");
    setCargando(true);
    try {
      const thumbName = `${Date.now()}_vthumb_${cleanFileName(videoThumb.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('galeria')
        .upload(thumbName, videoThumb, { contentType: videoThumb.type });
      
      if (uploadError) throw uploadError;
      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(thumbName);
      
      const { error: dbError } = await supabase.from('videos_proyectos').insert([
        { titulo: videoTitulo, youtube_url: videoUrl, url_miniatura: thumbData.publicUrl }
      ]);
      
      if (dbError) throw dbError;
      alert("¡Video publicado con éxito!");
      setVideoTitulo(''); setVideoUrl(''); setVideoThumb(null);
      fetchVideos();
    } catch (err: any) {
      alert("Error al subir video: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // --- LÓGICA DE BORRADO (DATABASE + STORAGE) ---
  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto? Los archivos se borrarán de Supabase.")) return;
    setCargando(true);
    try {
      const getFileName = (url: string) => url.split('/').pop();
      const filesToDelete: string[] = [];

      const thumbName = getFileName(thumbUrl);
      if (thumbName) filesToDelete.push(thumbName);

      if (infoUrls && infoUrls.length > 0) {
        infoUrls.forEach(url => {
          const name = getFileName(url);
          if (name) filesToDelete.push(name);
        });
      }

      // 1. Borrar archivos físicos del Bucket
      if (filesToDelete.length > 0) {
        await supabase.storage.from('galeria').remove(filesToDelete);
      }

      // 2. Borrar registro de la tabla
      await supabase.from('proyectos').delete().eq('id', id);

      alert("Proyecto e imágenes eliminados correctamente.");
      fetchProyectos();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm("¿Eliminar este video?")) return;
    setCargando(true);
    try {
      const fileName = thumbUrl.split('/').pop();
      if (fileName) await supabase.storage.from('galeria').remove([fileName]);
      await supabase.from('videos_proyectos').delete().eq('id', id);
      fetchVideos();
    } catch (err: any) {
      alert("Error al eliminar video: " + err.message);
    } finally {
      setCargando(false);
    }
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
          <section>
            <h2 className="text-[#7c8d74] font-bold mb-4 uppercase tracking-widest text-sm">Cargar Proyectos Fotográficos</h2>
            <form onSubmit={handlePublicar} className="bg-[#242622] p-8 rounded-sm shadow-2xl border-l-4 border-[#4a3424]">
              <div className="grid gap-6">
                <input type="text" placeholder="NOMBRE DEL PROYECTO" 
                  className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none" 
                  value={nombre} onChange={e => setNombre(e.target.value)} />
                <textarea placeholder="DESCRIPCIÓN TÉCNICA" rows={3}
                  className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none"
                  value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-zinc-800">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#7c8d74]">IMAGEN PORTADA</label>
                    <input type="file" accept="image/*" className="text-sm" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#7c8d74]">GALERÍA</label>
                    <input type="file" multiple accept="image/*" className="text-sm" 
                      onChange={e => { if (e.target.files) setArchivosOrdenados(Array.from(e.target.files)); }} />
                  </div>
                </div>

                {archivosOrdenados.length > 0 && (
                  <div className="bg-[#1a1c18] p-4 border border-zinc-800 rounded">
                    <div className="flex flex-wrap gap-2">
                      {archivosOrdenados.map((file, idx) => (
                        <div key={idx} className="relative group bg-[#2d302a] p-1 border border-zinc-700">
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover" alt="preview" />
                          <div className="flex justify-between bg-black/50 p-1">
                            <button type="button" disabled={idx === 0} onClick={() => moverArchivo(idx, 'izq')} className="text-[10px] disabled:opacity-20">←</button>
                            <span className="text-[10px]">{idx + 1}</span>
                            <button type="button" disabled={idx === archivosOrdenados.length - 1} onClick={() => moverArchivo(idx, 'der')} className="text-[10px] disabled:opacity-20">→</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button disabled={cargando} className="bg-[#4a3424] hover:bg-[#5d432d] text-white py-4 font-bold uppercase text-sm">
                  {cargando ? 'PROCESANDO...' : 'PUBLICAR PROYECTO'}
                </button>
              </div>
            </form>
          </section>

          <section>
            <h2 className="text-[#7c8d74] font-bold mb-4 uppercase tracking-widest text-sm">Cargar Video</h2>
            <form onSubmit={handlePublicarVideo} className="bg-[#242622] p-8 border-l-4 border-red-900 grid gap-6">
              <input type="text" placeholder="TÍTULO" className="w-full p-3 bg-[#2d302a] border border-zinc-700 outline-none" value={videoTitulo} onChange={e => setVideoTitulo(e.target.value)} />
              <input type="url" placeholder="URL YOUTUBE" className="w-full p-3 bg-[#2d302a] border border-zinc-700 outline-none" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
              <input type="file" accept="image/*" onChange={e => setVideoThumb(e.target.files?.[0] || null)} />
              <button disabled={cargando} className="bg-red-900 hover:bg-red-800 text-white py-4 font-bold uppercase text-sm">
                {cargando ? 'PROCESANDO...' : 'PUBLICAR VIDEO'}
              </button>
            </form>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
            <div>
              <h2 className="text-xl font-bold mb-6 text-zinc-400 uppercase text-xs">Fotos Activas</h2>
              <div className="grid gap-2">
                {proyectos.map(p => (
                  <div key={p.id} className="relative flex justify-between items-center bg-[#242622] p-4 border border-zinc-800 text-sm hover:border-[#7c8d74] transition-colors">
                    <span className="truncate mr-4 font-medium uppercase">{p.nombre}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleBorrar(p.id, p.miniatura_url, p.infografias);
                      }} 
                      className="relative z-50 text-red-500 hover:text-white hover:bg-red-600 px-3 py-1 rounded-sm font-bold uppercase text-[10px] cursor-pointer transition-all"
                    >
                      Borrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-zinc-400 uppercase text-xs">Videos Activos</h2>
              <div className="grid gap-2">
                {videos.map(v => (
                  <div key={v.id} className="relative flex justify-between items-center bg-[#242622] p-4 border border-zinc-800 text-sm hover:border-[#7c8d74] transition-colors">
                    <span className="truncate mr-4 font-medium uppercase">{v.titulo}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleBorrarVideo(v.id, v.url_miniatura);
                      }} 
                      className="relative z-50 text-red-500 hover:text-white hover:bg-red-600 px-3 py-1 rounded-sm font-bold uppercase text-[10px] cursor-pointer transition-all"
                    >
                      Borrar
                    </button>
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