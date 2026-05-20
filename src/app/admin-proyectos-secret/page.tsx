'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import imageCompression from 'browser-image-compression';
import { Trash2, Video, Image as ImageIcon, X, Edit2, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

// --- FUNCIÓN DE COMPRESIÓN ---
const comprimirImagen = async (file: File): Promise<File> => {
  return await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
};

// --- TIPOS TOAST ---
type ToastType = 'success' | 'error';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// --- COMPONENTE TOAST ---
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-bold uppercase tracking-wider transition-all duration-500
            ${t.type === 'success'
              ? 'bg-[#1c1e1a] border-[#7c8d74] text-[#7c8d74]'
              : 'bg-[#1c1e1a] border-red-700 text-red-400'}`}
        >
          {t.type === 'success'
            ? <CheckCircle size={18} className="shrink-0" />
            : <AlertCircle size={18} className="shrink-0" />}
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 text-zinc-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENTE BARRA DE PROGRESO ---
function ProgressBar({ progreso, label }: { progreso: number; label: string }) {
  if (progreso === 0) return null;
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{label}</span>
        <span className="text-[10px] text-[#7c8d74] font-black">{progreso}%</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7c8d74] rounded-full transition-all duration-300"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
  // --- ESTADOS PROYECTOS ---
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esVoluntario, setEsVoluntario] = useState(false);
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [archivosOrdenados, setArchivosOrdenados] = useState<File[]>([]);
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
  const [progreso, setProgreso] = useState(0);
  const [labelProgreso, setLabelProgreso] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- TOAST HELPERS ---
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

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
    const nuevos = [...archivosOrdenados];
    const item = nuevos.splice(index, 1)[0];
    const nuevaPos = direccion === 'izq' ? index - 1 : index + 1;
    nuevos.splice(nuevaPos, 0, item);
    setArchivosOrdenados(nuevos);
  };

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
    setProgreso(0);
  };

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
    setProgreso(0);
  };

  // --- PUBLICAR / EDITAR PROYECTO ---
  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return showToast('Nombre obligatorio', 'error');
    setCargando(true);
    setProgreso(0);

    try {
      // Calcular total de pasos: miniatura (si hay) + láminas
      const totalPasos = (miniatura ? 1 : 0) + archivosOrdenados.length;
      let pasoActual = 0;

      const avanzar = () => {
        pasoActual++;
        setProgreso(Math.round((pasoActual / totalPasos) * 100));
      };

      let urlFinalMiniatura = miniaturaExistente;
      if (miniatura) {
        setLabelProgreso('Comprimiendo portada...');
        const comprimida = await comprimirImagen(miniatura);
        setLabelProgreso('Subiendo portada...');
        const minName = `${Date.now()}_thumb_${cleanFileName(comprimida.name)}`;
        await supabase.storage.from('galeria').upload(minName, comprimida);
        const { data } = supabase.storage.from('galeria').getPublicUrl(minName);
        urlFinalMiniatura = data.publicUrl;
        avanzar();
      }

      const nuevasUrls = [];
      for (let i = 0; i < archivosOrdenados.length; i++) {
        const file = archivosOrdenados[i];
        setLabelProgreso(`Comprimiendo lámina ${i + 1} de ${archivosOrdenados.length}...`);
        const comprimida = await comprimirImagen(file);
        setLabelProgreso(`Subiendo lámina ${i + 1} de ${archivosOrdenados.length}...`);
        const fileName = `${Date.now()}_info_${cleanFileName(comprimida.name)}`;
        await supabase.storage.from('galeria').upload(fileName, comprimida);
        const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
        nuevasUrls.push(data.publicUrl);
        avanzar();
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
        if (!miniatura) throw new Error('Miniatura obligatoria');
        await supabase.from('proyectos').insert([payload]);
      }

      showToast('¡Proyecto sincronizado con éxito!', 'success');
      cancelarEdicion();
      fetchProyectos();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCargando(false);
      setProgreso(0);
      setLabelProgreso('');
    }
  };

  // --- PUBLICAR / EDITAR VIDEO ---
  const handlePublicarVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitulo || !videoUrl) return showToast('Título y URL obligatorios', 'error');
    setCargando(true);
    setProgreso(0);

    try {
      let urlFinalThumb = videoThumbExistente;
      if (videoThumb) {
        setLabelProgreso('Comprimiendo miniatura...');
        setProgreso(30);
        const comprimida = await comprimirImagen(videoThumb);
        setLabelProgreso('Subiendo miniatura...');
        setProgreso(65);
        const thumbName = `${Date.now()}_vthumb_${cleanFileName(comprimida.name)}`;
        await supabase.storage.from('galeria').upload(thumbName, comprimida);
        const { data } = supabase.storage.from('galeria').getPublicUrl(thumbName);
        urlFinalThumb = data.publicUrl;
        setProgreso(100);
      }

      const payload = {
        titulo: videoTitulo,
        youtube_url: videoUrl,
        url_miniatura: urlFinalThumb
      };

      if (editandoVideoId) {
        await supabase.from('videos_proyectos').update(payload).eq('id', editandoVideoId);
      } else {
        if (!videoThumb) throw new Error('Miniatura de video obligatoria');
        await supabase.from('videos_proyectos').insert([payload]);
      }

      showToast('¡Video guardado con éxito!', 'success');
      cancelarEdicionVideo();
      fetchVideos();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCargando(false);
      setProgreso(0);
      setLabelProgreso('');
    }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm('¿Eliminar permanentemente? Se borrarán los archivos del servidor.')) return;
    try {
      const getFileName = (url: string) => url.split('/').pop()?.split('?')[0];
      const files = [getFileName(thumbUrl), ...(infoUrls?.map(getFileName) || [])].filter(Boolean) as string[];
      if (files.length) await supabase.storage.from('galeria').remove(files);
      await supabase.from('proyectos').delete().eq('id', id);
      showToast('Proyecto eliminado', 'error');
      fetchProyectos();
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm('¿Eliminar video permanentemente?')) return;
    try {
      const fileName = thumbUrl.split('/').pop()?.split('?')[0];
      if (fileName) await supabase.storage.from('galeria').remove([fileName]);
      await supabase.from('videos_proyectos').delete().eq('id', id);
      showToast('Video eliminado', 'error');
      fetchVideos();
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  return (
    <div className="p-4 md:p-12 bg-[#141512] min-h-screen text-zinc-100">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-2xl font-black uppercase italic">KOH <span className="text-[#7c8d74]">ADMIN</span></h1>
          <p className="text-[10px] text-zinc-500 font-mono self-end">v2.7 — Toast + Progress</p>
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
                    <p className="text-[9px] text-[#7c8d74] mb-2">↓ Se comprime a &lt;500 KB automáticamente</p>
                    {miniaturaExistente && !miniatura && <img src={miniaturaExistente} className="w-full h-20 object-cover mb-2 rounded border border-zinc-800" />}
                    <input type="file" accept="image/png, image/jpeg" className="text-[10px]" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="p-4 bg-[#141512] border border-zinc-800">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Láminas (PNG/JPG)</label>
                    <p className="text-[9px] text-[#7c8d74] mb-2">↓ Se comprimen a &lt;500 KB automáticamente</p>
                    <input type="file" accept="image/png, image/jpeg" multiple className="text-[10px]" onChange={e => e.target.files && setArchivosOrdenados(Array.from(e.target.files))} />
                  </div>
                </div>

                {/* ORDEN DE GALERÍA */}
                {archivosOrdenados.length > 0 && (
                  <div className="p-4 bg-black/40 rounded border border-[#7c8d74]/30">
                    <p className="text-[10px] font-black text-[#7c8d74] uppercase mb-4 tracking-widest text-center">Organizar láminas nuevas</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {archivosOrdenados.map((file, idx) => (
                        <div key={idx} className="bg-[#1c1e1a] p-2 rounded-lg border border-zinc-800 relative group">
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded shadow-lg" alt="preview" />
                          <div className="flex justify-between mt-2 px-1">
                            <button type="button" disabled={idx === 0} onClick={() => moverArchivo(idx, 'izq')} className="text-zinc-500 hover:text-[#7c8d74] disabled:opacity-0 transition-colors">
                              <ArrowLeft size={16} />
                            </button>
                            <span className="text-[10px] font-black text-[#7c8d74]">{idx + 1}</span>
                            <button type="button" disabled={idx === archivosOrdenados.length - 1} onClick={() => moverArchivo(idx, 'der')} className="text-zinc-500 hover:text-[#7c8d74] disabled:opacity-0 transition-colors">
                              <ArrowRight size={16} />
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
                          <button type="button" onClick={() => setUrlsExistentes(urlsExistentes.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 shadow-lg"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BARRA DE PROGRESO PROYECTO */}
                {cargando && <ProgressBar progreso={progreso} label={labelProgreso} />}

                <button disabled={cargando} className="w-full py-4 bg-[#7c8d74] text-white font-black text-xs uppercase tracking-widest hover:bg-[#6b7a64] transition-all shadow-lg shadow-black/50 disabled:opacity-60">
                  {cargando ? 'PROCESANDO...' : editandoId ? 'GUARDAR PROYECTO' : 'PUBLICAR PROYECTO'}
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
                  <p className="text-[9px] text-[#7c8d74] mb-2">↓ Se comprime a &lt;500 KB automáticamente</p>
                  {videoThumbExistente && !videoThumb && <img src={videoThumbExistente} className="w-40 h-20 object-cover mb-2 rounded border border-zinc-800" />}
                  <input type="file" accept="image/png, image/jpeg" className="text-[10px]" onChange={e => setVideoThumb(e.target.files?.[0] || null)} />
                </div>

                {/* BARRA DE PROGRESO VIDEO */}
                {cargando && <ProgressBar progreso={progreso} label={labelProgreso} />}

                <button disabled={cargando} className="w-full py-4 bg-red-900/20 hover:bg-red-900 border border-red-900 text-red-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-60">
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
                      <button onClick={() => prepararEdicion(p)} className="p-2 text-zinc-400 hover:text-white"><Edit2 size={14} /></button>
                      <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
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
                      <button onClick={() => prepararEdicionVideo(v)} className="p-2 text-zinc-400 hover:text-white"><Edit2 size={14} /></button>
                      <button onClick={() => handleBorrarVideo(v.id, v.url_miniatura)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
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