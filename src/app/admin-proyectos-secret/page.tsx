'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Trash2, Plus, Video, Image as ImageIcon, HardHat, X, Edit2, Save, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  // --- ESTADOS PROYECTOS ---
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esVoluntario, setEsVoluntario] = useState(false);
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [archivosOrdenados, setArchivosOrdenados] = useState<File[]>([]); // AQUÍ SE GUARDAN LAS LÁMINAS
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [urlsExistentes, setUrlsExistentes] = useState<string[]>([]);
  const [miniaturaExistente, setMiniaturaExistente] = useState('');

  // --- ESTADOS VIDEOS ---
  const [videoTitulo, setVideoTitulo] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumb, setVideoThumb] = useState<File | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [editandoVideoId, setEditandoVideoId] = useState<string | null>(null);
  const [videoThumbExistente, setVideoThumbExistente] = useState('');

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

  // --- LÓGICA DE ORDENAMIENTO DE LÁMINAS NUEVAS ---
  const moverArchivo = (index: number, direccion: 'izq' | 'der') => {
    const nuevos = [...archivosOrdenados];
    const item = nuevos.splice(index, 1)[0];
    const nuevaPos = direccion === 'izq' ? index - 1 : index + 1;
    nuevos.splice(nuevaPos, 0, item);
    setArchivosOrdenados(nuevos);
  };

  // --- LÓGICA EDICIÓN PROYECTOS ---
  const prepararEdicion = (p: any) => {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setEsVoluntario(p.es_voluntario || false);
    setMiniaturaExistente(p.miniatura_url);
    setUrlsExistentes(p.infografias || []);
    setArchivosOrdenados([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre(''); setDescripcion(''); setEsVoluntario(false);
    setMiniaturaExistente(''); setUrlsExistentes([]); setArchivosOrdenados([]);
  };

  // --- LÓGICA EDICIÓN VIDEOS ---
  const prepararEdicionVideo = (v: any) => {
    setEditandoVideoId(v.id);
    setVideoTitulo(v.titulo);
    setVideoUrl(v.youtube_url);
    setVideoThumbExistente(v.url_miniatura);
    setVideoThumb(null);
  };

  const cancelarEdicionVideo = () => {
    setEditandoVideoId(null);
    setVideoTitulo(''); setVideoUrl(''); setVideoThumbExistente(''); setVideoThumb(null);
  };

  // --- PUBLICAR / EDITAR PROYECTO ---
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return alert("Nombre obligatorio");
    setCargando(true);
    try {
      let urlFinalMiniatura = miniaturaExistente;
      if (miniatura) {
        const minName = `${Date.now()}_thumb_${cleanFileName(miniatura.name)}`;
        await supabase.storage.from('galeria').upload(minName, miniatura);
        const { data } = supabase.storage.from('galeria').getPublicUrl(minName);
        urlFinalMiniatura = data.publicUrl;
      }

      const nuevasUrls = [];
      for (const file of archivosOrdenados) {
        const fileName = `${Date.now()}_info_${cleanFileName(file.name)}`;
        await supabase.storage.from('galeria').upload(fileName, file);
        const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
        nuevasUrls.push(data.publicUrl);
      }

      const payload = {
        nombre,
        descripcion,
        es_voluntario: esVoluntario,
        miniatura_url: urlFinalMiniatura,
        infografias: [...urlsExistentes, ...nuevasUrls]
      };

      if (editandoId) {
        await supabase.from('proyectos').update(payload).eq('id', editandoId);
      } else {
        if (!miniatura) throw new Error("Miniatura obligatoria");
        await supabase.from('proyectos').insert([payload]);
      }

      alert("¡Sincronizado con éxito!");
      cancelarEdicion();
      fetchProyectos();
    } catch (err: any) { alert(err.message); } finally { setCargando(false); }
  };

  // --- PUBLICAR / EDITAR VIDEO ---
  const handlePublicarVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitulo || !videoUrl) return alert("Título y URL obligatorios");
    setCargando(true);
    try {
      let urlFinalThumb = videoThumbExistente;
      if (videoThumb) {
        const thumbName = `${Date.now()}_vthumb_${cleanFileName(videoThumb.name)}`;
        await supabase.storage.from('galeria').upload(thumbName, videoThumb);
        const { data } = supabase.storage.from('galeria').getPublicUrl(thumbName);
        urlFinalThumb = data.publicUrl;
      }

      const payload = {
        titulo: videoTitulo,
        youtube_url: videoUrl,
        url_miniatura: urlFinalThumb
      };

      if (editandoVideoId) {
        await supabase.from('videos_proyectos').update(payload).eq('id', editandoVideoId);
      } else {
        if (!videoThumb) throw new Error("Miniatura de video obligatoria");
        await supabase.from('videos_proyectos').insert([payload]);
      }

      alert("¡Video guardado!");
      cancelarEdicionVideo();
      fetchVideos();
    } catch (err: any) { alert(err.message); } finally { setCargando(false); }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Eliminar permanentemente? Se borrarán los archivos del servidor.")) return;
    try {
      const getFileName = (url: string) => url.split('/').pop()?.split('?')[0];
      const files = [getFileName(thumbUrl), ...(infoUrls?.map(getFileName) || [])].filter(Boolean) as string[];
      if (files.length) await supabase.storage.from('galeria').remove(files);
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    } catch (err: any) { alert(err.message); }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm("¿Eliminar video permanentemente?")) return;
    try {
      const fileName = thumbUrl.split('/').pop()?.split('?')[0];
      if (fileName) await supabase.storage.from('galeria').remove([fileName]);
      await supabase.from('videos_proyectos').delete().eq('id', id);
      fetchVideos();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-4 md:p-12 bg-[#141512] min-h-screen text-zinc-100">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-2xl font-black uppercase italic">KOH <span className="text-[#7c8d74]">ADMIN</span></h1>
          <p className="text-[10px] text-zinc-500 font-mono self-end">v2.5 — Gestión de Orden</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUMNA FORMULARIOS */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* FORM PROYECTOS */}
            <section className="bg-[#1c1e1a] p-8 rounded-xl border border-zinc-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="text-[#7c8d74] h-5 w-5" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#7c8d74]">
                    {editandoId ? 'Editando Proyecto' : 'Nueva Obra'}
                  </h2>
                </div>
                {editandoId && <button onClick={cancelarEdicion} className="text-[10px] text-red-400 border border-red-900 px-2 py-1 uppercase font-bold">Cancelar Edición</button>}
              </div>
              
              <form onSubmit={handlePublicar} className="space-y-6">
                <input type="text" placeholder="NOMBRE DEL PROYECTO" className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none focus:border-[#7c8d74]" value={nombre} onChange={e => setNombre(e.target.value)} />
                <textarea placeholder="DESCRIPCIÓN TÉCNICA" rows={3} className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none focus:border-[#7c8d74]" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                
                <div className="flex items-center gap-3 p-4 bg-blue-950/10 border border-blue-500/20 rounded-lg">
                  <input type="checkbox" id="vol" className="w-5 h-5 accent-[#7c8d74]" checked={esVoluntario} onChange={e => setEsVoluntario(e.target.checked)} />
                  <label htmlFor="vol" className="text-xs font-bold uppercase cursor-pointer text-blue-400">¿Es anteproyecto voluntario? (Aviso Legal)</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#141512] border border-zinc-800">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Portada (PNG/JPG)</label>
                    {miniaturaExistente && !miniatura && <img src={miniaturaExistente} className="w-full h-20 object-cover mb-2 rounded border border-zinc-800" />}
                    <input type="file" accept="image/png, image/jpeg" className="text-[10px]" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="p-4 bg-[#141512] border border-zinc-800">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Láminas (PNG/JPG)</label>
                    <input type="file" accept="image/png, image/jpeg" multiple className="text-[10px]" onChange={e => e.target.files && setArchivosOrdenados(Array.from(e.target.files))} />
                  </div>
                </div>

                {/* --- AQUÍ ESTÁ EL BLOQUE DEL ORDEN DE GALERÍA --- */}
                {archivosOrdenados.length > 0 && (
                  <div className="p-4 bg-black/40 rounded border border-[#7c8d74]/30">
                    <p className="text-[10px] font-black text-[#7c8d74] uppercase mb-4 tracking-widest text-center">Organizar láminas nuevas</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {archivosOrdenados.map((file, idx) => (
                        <div key={idx} className="bg-[#1c1e1a] p-2 rounded-lg border border-zinc-800 relative group">
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded shadow-lg" alt="preview" />
                          <div className="flex justify-between mt-2 px-1">
                            <button type="button" disabled={idx === 0} onClick={() => moverArchivo(idx, 'izq')} className="text-zinc-500 hover:text-[#7c8d74] disabled:opacity-0 transition-colors">
                              <ArrowLeft size={16}/>
                            </button>
                            <span className="text-[10px] font-black text-[#7c8d74]">{idx + 1}</span>
                            <button type="button" disabled={idx === archivosOrdenados.length - 1} onClick={() => moverArchivo(idx, 'der')} className="text-zinc-500 hover:text-[#7c8d74] disabled:opacity-0 transition-colors">
                              <ArrowRight size={16}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {urlsExistentes.length > 0 && (
                  <div className="space-y-2">
                     <p className="text-[9px] text-zinc-500 uppercase font-bold">Láminas actuales (Presiona X para quitar)</p>
                     <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded border border-zinc-800">
                        {urlsExistentes.map((url, i) => (
                          <div key={i} className="relative group w-16 h-16">
                            <img src={url} className="w-full h-full object-cover rounded border border-zinc-800" />
                            <button type="button" onClick={() => setUrlsExistentes(urlsExistentes.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 shadow-lg"><X size={10}/></button>
                          </div>
                        ))}
                      </div>
                  </div>
                )}

                <button disabled={cargando} className="w-full py-4 bg-[#7c8d74] text-white font-black text-xs uppercase tracking-widest hover:bg-[#6b7a64] transition-all shadow-lg shadow-black/50">
                  {cargando ? 'SINCRONIZANDO...' : editandoId ? 'GUARDAR PROYECTO' : 'PUBLICAR PROYECTO'}
                </button>
              </form>
            </section>

            {/* FORM VIDEOS */}
            <section className="bg-[#1c1e1a] p-8 rounded-xl border border-zinc-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Video className="text-red-700 h-5 w-5" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-red-700">
                    {editandoVideoId ? 'Editando Video' : 'Cargar Recorrido'}
                  </h2>
                </div>
                {editandoVideoId && <button onClick={cancelarEdicionVideo} className="text-[10px] text-red-400 border border-red-900 px-2 py-1 uppercase font-bold">CANCELAR</button>}
              </div>
              <form onSubmit={handlePublicarVideo} className="space-y-4">
                <input type="text" placeholder="TÍTULO" className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none focus:border-red-700" value={videoTitulo} onChange={e => setVideoTitulo(e.target.value)} />
                <input type="url" placeholder="URL YOUTUBE" className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm outline-none focus:border-red-700" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                <div className="p-4 bg-[#141512] border border-zinc-800">
                   <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Miniatura del Video (PNG/JPG)</label>
                   {videoThumbExistente && !videoThumb && <img src={videoThumbExistente} className="w-40 h-20 object-cover mb-2 rounded border border-zinc-800" />}
                   <input type="file" accept="image/png, image/jpeg" className="text-[10px]" onChange={e => setVideoThumb(e.target.files?.[0] || null)} />
                </div>
                <button disabled={cargando} className="w-full py-4 bg-red-900/20 hover:bg-red-900 border border-red-900 text-red-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
                  {editandoVideoId ? 'GUARDAR CAMBIOS VIDEO' : 'PUBLICAR VIDEO'}
                </button>
              </form>
            </section>
          </div>

          {/* LISTADOS LATERALES */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 border-l-2 border-[#7c8d74] pl-2">Portafolio Online</h3>
              <div className="space-y-3">
                {proyectos.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-[#1c1e1a] p-4 border border-zinc-800 rounded-lg group hover:border-[#7c8d74]/50 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={p.miniatura_url} className="w-10 h-10 object-cover rounded border border-zinc-800 shadow-inner" />
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase truncate w-32">{p.nombre}</span>
                         {p.es_voluntario && <span className="text-[7px] text-[#7c8d74] font-bold uppercase tracking-tighter">Voluntario</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => prepararEdicion(p)} className="p-2 text-zinc-400 hover:text-white"><Edit2 size={14}/></button>
                      <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 border-l-2 border-red-900 pl-2">Videos Online</h3>
              <div className="space-y-3">
                {videos.map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-[#1c1e1a] p-4 border border-zinc-800 rounded-lg group hover:border-red-900/50 transition-all">
                    <span className="text-[10px] font-black uppercase truncate w-40">{v.titulo}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => prepararEdicionVideo(v)} className="p-2 text-zinc-400 hover:text-white"><Edit2 size={14}/></button>
                      <button onClick={() => handleBorrarVideo(v.id, v.url_miniatura)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
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