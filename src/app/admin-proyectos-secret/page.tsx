'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Trash2, Plus, Video, Image as ImageIcon, HardHat } from 'lucide-react';

export default function AdminPage() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [archivosOrdenados, setArchivosOrdenados] = useState<File[]>([]);

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

  const cleanFileName = (name: string) => name.replace(/[^a-zA-Z0-9.]/g, '_');

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
      const miniaturaName = `${Date.now()}_thumb_${cleanFileName(miniatura.name)}`;
      const { error: thumbError } = await supabase.storage.from('galeria').upload(miniaturaName, miniatura);
      if (thumbError) throw thumbError;
      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(miniaturaName);

      const infoUrls = [];
      for (const file of archivosOrdenados) {
        const fileName = `${Date.now()}_info_${cleanFileName(file.name)}`;
        await supabase.storage.from('galeria').upload(fileName, file);
        const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
        infoUrls.push(data.publicUrl);
      }

      await supabase.from('proyectos').insert([{ nombre, descripcion, miniatura_url: thumbData.publicUrl, infografias: infoUrls }]);
      alert("¡Proyecto KOH publicado!");
      setNombre(''); setDescripcion(''); setArchivosOrdenados([]); setMiniatura(null);
      fetchProyectos();
    } catch (err: any) { alert(err.message); } finally { setCargando(false); }
  };

  const handlePublicarVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitulo || !videoUrl || !videoThumb) return alert("Campos obligatorios");
    setCargando(true);
    try {
      const thumbName = `${Date.now()}_vthumb_${cleanFileName(videoThumb.name)}`;
      await supabase.storage.from('galeria').upload(thumbName, videoThumb);
      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(thumbName);
      await supabase.from('videos_proyectos').insert([{ titulo: videoTitulo, youtube_url: videoUrl, url_miniatura: thumbData.publicUrl }]);
      setVideoTitulo(''); setVideoUrl(''); setVideoThumb(null);
      fetchVideos();
    } catch (err: any) { alert(err.message); } finally { setCargando(false); }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Eliminar proyecto?")) return;
    try {
      const getFileName = (url: string) => url.split('/').pop();
      const files = [getFileName(thumbUrl), ...(infoUrls?.map(getFileName) || [])].filter(Boolean) as string[];
      if (files.length) await supabase.storage.from('galeria').remove(files);
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    } catch (err: any) { alert(err.message); }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm("¿Eliminar video?")) return;
    try {
      const fileName = thumbUrl.split('/').pop();
      if (fileName) await supabase.storage.from('galeria').remove([fileName]);
      await supabase.from('videos_proyectos').delete().eq('id', id);
      fetchVideos();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-4 md:p-12 bg-[#141512] min-h-screen text-zinc-100 selection:bg-[#7c8d74]">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-zinc-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HardHat className="text-[#7c8d74] h-5 w-5" />
              <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-bold">Consola de Administración</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              KOH <span className="text-[#7c8d74]">PORTFOLIO</span>
            </h1>
          </div>
          <div className="text-right">
             <p className="text-xs text-zinc-500 font-mono">v2.0.26 — Supabase Cloud</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUMNA IZQUIERDA: FORMULARIOS */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* FORM PROYECTOS */}
            <section className="bg-[#1c1e1a] border border-zinc-800 p-8 rounded-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="text-[#7c8d74] h-5 w-5" />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#7c8d74]">Cargar Obra Fotográfica</h2>
              </div>
              
              <form onSubmit={handlePublicar} className="space-y-6">
                <input 
                  type="text" placeholder="NOMBRE DEL PROYECTO" 
                  className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none focus:border-[#7c8d74] transition-colors"
                  value={nombre} onChange={e => setNombre(e.target.value)}
                />
                <textarea 
                  placeholder="ESPECIFICACIONES TÉCNICAS Y DESCRIPCIÓN" rows={4}
                  className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none focus:border-[#7c8d74] transition-colors"
                  value={descripcion} onChange={e => setDescripcion(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-zinc-800 bg-[#141512]">
                    <label className="text-[10px] block mb-2 text-zinc-500 font-bold uppercase">Portada (Principal)</label>
                    <input type="file" accept="image/*" className="text-[10px] file:bg-[#7c8d74] file:text-white file:border-none file:px-3 file:py-1 file:rounded-full file:mr-4 file:cursor-pointer" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="p-4 border border-zinc-800 bg-[#141512]">
                    <label className="text-[10px] block mb-2 text-zinc-500 font-bold uppercase">Galería (Múltiple)</label>
                    <input type="file" multiple accept="image/*" className="text-[10px] file:bg-zinc-700 file:text-white file:border-none file:px-3 file:py-1 file:rounded-full file:mr-4 file:cursor-pointer" 
                      onChange={e => { if (e.target.files) setArchivosOrdenados(Array.from(e.target.files)); }} />
                  </div>
                </div>

                {archivosOrdenados.length > 0 && (
                  <div className="flex flex-wrap gap-3 p-4 bg-[#141512] border border-zinc-800">
                    {archivosOrdenados.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 border border-zinc-700">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="prev" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 flex justify-between text-[8px] px-1">
                          <button type="button" onClick={() => moverArchivo(idx, 'izq')} disabled={idx === 0}>←</button>
                          <span>{idx + 1}</span>
                          <button type="button" onClick={() => moverArchivo(idx, 'der')} disabled={idx === archivosOrdenados.length - 1}>→</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button disabled={cargando} className="w-full py-4 bg-[#7c8d74] hover:bg-[#6b7a64] text-white text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50">
                  {cargando ? 'Sincronizando...' : 'REGISTRAR PROYECTO'}
                </button>
              </form>
            </section>

            {/* FORM VIDEOS */}
            <section className="bg-[#1c1e1a] border border-zinc-800 p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <Video className="text-red-800 h-5 w-5" />
                <h2 className="text-sm font-black uppercase tracking-widest text-red-800">Cargar Recorrido Virtual</h2>
              </div>
              <form onSubmit={handlePublicarVideo} className="space-y-4">
                <input type="text" placeholder="TÍTULO DEL VIDEO" className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none" value={videoTitulo} onChange={e => setVideoTitulo(e.target.value)} />
                <input type="url" placeholder="LINK DE YOUTUBE" className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                <div className="p-4 border border-zinc-800 bg-[#141512]">
                   <label className="text-[10px] block mb-2 text-zinc-500 font-bold uppercase">Miniatura del Video</label>
                   <input type="file" accept="image/*" className="text-[10px]" onChange={e => setVideoThumb(e.target.files?.[0] || null)} />
                </div>
                <button disabled={cargando} className="w-full py-4 bg-red-900/20 hover:bg-red-900 border border-red-900 text-red-500 hover:text-white text-xs font-black uppercase tracking-[0.2em] transition-all">
                   PUBLICAR VIDEO
                </button>
              </form>
            </section>
          </div>

          {/* COLUMNA DERECHA: LISTADOS */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-zinc-800"></span> Proyectos en línea
              </h3>
              <div className="space-y-3">
                {proyectos.map(p => (
                  <div key={p.id} className="group flex items-center justify-between bg-[#1c1e1a] p-4 border border-zinc-800 hover:border-zinc-600 transition-all">
                    <div className="flex items-center gap-4">
                       <img src={p.miniatura_url} className="w-10 h-10 object-cover rounded shadow-lg" alt="" />
                       <span className="text-xs font-bold uppercase tracking-tight truncate w-32 md:w-48">{p.nombre}</span>
                    </div>
                    <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all">
                      <Trash2 h-4 w-4 />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-zinc-800"></span> Videos en línea
              </h3>
              <div className="space-y-3">
                {videos.map(v => (
                  <div key={v.id} className="group flex items-center justify-between bg-[#1c1e1a] p-4 border border-zinc-800 hover:border-zinc-600 transition-all">
                    <span className="text-xs font-bold uppercase truncate w-40">{v.titulo}</span>
                    <button onClick={() => handleBorrarVideo(v.id, v.url_miniatura)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all">
                      <Trash2 h-4 w-4 />
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