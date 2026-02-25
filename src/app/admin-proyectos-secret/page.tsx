'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AdminPage() {
  // Estados para Proyectos (Fotos)
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  
  // Estado para manejar el orden de los archivos antes de subir
  const [archivosOrdenados, setArchivosOrdenados] = useState<File[]>([]);

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

  const moverArchivo = (index: number, direccion: 'izq' | 'der') => {
    const nuevosArchivos = [...archivosOrdenados];
    const file = nuevosArchivos.splice(index, 1)[0];
    const nuevaPos = direccion === 'izq' ? index - 1 : index + 1;
    nuevosArchivos.splice(nuevaPos, 0, file);
    setArchivosOrdenados(nuevosArchivos);
  };

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
      if (archivosOrdenados.length > 0) {
        for (let i = 0; i < archivosOrdenados.length; i++) {
          const file = archivosOrdenados[i];
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
      setNombre(''); setDescripcion(''); setArchivosOrdenados([]);
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
      if (infoUrls) infoUrls.forEach(url => {
          const fileName = url.split('/').pop();
          if (fileName) filesToDelete.push(fileName);
      });
      await supabase.storage.from('galeria').remove(filesToDelete);
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    } catch (err) { alert("Error al eliminar"); }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm("¿Eliminar este video?")) return;
    try {
      setCargando(true);
      const fileName = thumbUrl.split('/').pop();
      if (fileName) await supabase.storage.from('galeria').remove([fileName]);
      const { error } = await supabase.from('videos_proyectos').delete().eq('id', id);
      if (error) throw error;
      fetchVideos();
    } catch (err: any) { alert("Error al eliminar video: " + err.message); } finally { setCargando(false); }
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
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover" />
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
              <button disabled={cargando} className="bg-red-900 hover:bg-red-800 text-white py-4 font-bold uppercase text-sm">PUBLICAR VIDEO</button>
            </form>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
            <div>
              <h2 className="text-xl font-bold mb-6 text-zinc-400 uppercase text-xs">Fotos Activas</h2>
              <div className="grid gap-2">
                {proyectos.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-[#242622] p-4 border border-zinc-800 text-sm">
                    <span className="truncate mr-4">{p.nombre}</span>
                    <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} className="text-red-500 font-bold uppercase text-[10px] cursor-pointer">Borrar</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-zinc-400 uppercase text-xs">Videos Activos</h2>
              <div className="grid gap-2">
                {videos.map(v => (
                  <div key={v.id} className="flex justify-between items-center bg-[#242622] p-4 border border-zinc-800 text-sm">
                    <span className="truncate mr-4">{v.titulo}</span>
                    <button onClick={() => handleBorrarVideo(v.id, v.url_miniatura)} className="text-red-500 font-bold uppercase text-[10px] cursor-pointer">Borrar</button>
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