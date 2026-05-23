'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import imageCompression from 'browser-image-compression';
import { Trash2, Video, Image as ImageIcon, X, Edit2, CheckCircle, AlertCircle, GripVertical, HardDrive, RefreshCw } from 'lucide-react';

const comprimirImagen = async (file: File): Promise<File> => {
  return await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
};

type ToastType = 'success' | 'error';
interface Toast { id: number; message: string; type: ToastType; }

function ToastCenter({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;
  const t = toasts[toasts.length - 1];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`pointer-events-auto flex flex-col items-center gap-4 px-10 py-8 rounded-2xl shadow-2xl border backdrop-blur-sm
        ${t.type === 'success' ? 'bg-[#1c1e1a]/95 border-[#7c8d74]' : 'bg-[#1c1e1a]/95 border-red-700'}`}>
        {t.type === 'success'
          ? <CheckCircle size={48} className="text-[#7c8d74]" />
          : <AlertCircle size={48} className="text-red-400" />}
        <p className={`text-sm font-black uppercase tracking-widest text-center ${t.type === 'success' ? 'text-[#7c8d74]' : 'text-red-400'}`}>
          {t.message}
        </p>
        <button onClick={() => onRemove(t.id)} className="mt-2 text-[10px] text-zinc-500 hover:text-white uppercase font-bold border border-zinc-700 px-4 py-1 rounded transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ progreso, label }: { progreso: number; label: string }) {
  if (progreso === 0) return null;
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{label}</span>
        <span className="text-[10px] text-[#7c8d74] font-black">{progreso}%</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-[#7c8d74] rounded-full transition-all duration-300" style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}

// --- STORAGE WIDGET ---
const LIMITE_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB plan gratuito Supabase

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function StorageWidget({ refrescar }: { refrescar: number }) {
  const [totalBytes, setTotalBytes] = useState<number | null>(null);
  const [totalArchivos, setTotalArchivos] = useState(0);
  const [cargando, setCargando] = useState(true);

  const calcularStorage = useCallback(async () => {
    setCargando(true);
    try {
      let offset = 0;
      let todos: any[] = [];
      while (true) {
        const { data, error } = await supabase.storage.from('galeria').list('', {
          limit: 100,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        });
        if (error || !data || data.length === 0) break;
        todos = [...todos, ...data];
        if (data.length < 100) break;
        offset += 100;
      }
      const suma = todos.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
      setTotalBytes(suma);
      setTotalArchivos(todos.length);
    } catch (err) {
      console.error('Error calculando storage:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { calcularStorage(); }, [calcularStorage, refrescar]);

  const porcentaje = totalBytes !== null ? Math.min((totalBytes / LIMITE_BYTES) * 100, 100) : 0;
  const barColor = porcentaje > 80 ? 'bg-red-500' : porcentaje > 50 ? 'bg-yellow-500' : 'bg-[#7c8d74]';
  const textColor = porcentaje > 80 ? 'text-red-400' : porcentaje > 50 ? 'text-yellow-400' : 'text-[#7c8d74]';

  return (
    <div className="bg-[#1c1e1a] rounded-xl border border-zinc-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive size={14} className="text-[#7c8d74]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Almacenamiento en la Nube</span>
        </div>
        <button onClick={calcularStorage} className="text-zinc-600 hover:text-[#7c8d74] transition-colors" title="Refrescar">
          <RefreshCw size={12} className={cargando ? 'animate-spin' : ''} />
        </button>
      </div>

      {cargando ? (
        <div className="space-y-2">
          <div className="h-1.5 bg-zinc-800 rounded-full animate-pulse" />
          <div className="h-3 w-1/2 bg-zinc-800 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-black ${textColor}`}>{formatBytes(totalBytes ?? 0)} usados</span>
              <span className="text-[10px] text-zinc-600 font-bold">1 GB límite</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
            <div className="text-center">
              <p className={`text-sm font-black ${textColor}`}>{porcentaje.toFixed(1)}%</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold">Usado</p>
            </div>
            <div className="text-center border-x border-zinc-800">
              <p className="text-sm font-black text-zinc-300">{totalArchivos}</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold">Archivos</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-zinc-300">{formatBytes(LIMITE_BYTES - (totalBytes ?? 0))}</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold">Disponibles</p>
            </div>
          </div>

          {porcentaje > 80 && (
            <div className="flex items-center gap-2 p-2 bg-red-950/30 rounded-lg border border-red-900/50">
              <AlertCircle size={12} className="text-red-500 shrink-0" />
              <p className="text-[9px] text-red-400 font-bold">Almacenamiento casi lleno. Considera eliminar archivos.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- DRAG & DROP PARA LÁMINAS ---
function LaminasSorter({ archivos, onChange }: { archivos: File[]; onChange: (files: File[]) => void }) {
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (idx: number) => { dragIndex.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop = (idx: number) => {
    if (dragIndex.current === null || dragIndex.current === idx) { setDragOver(null); return; }
    const nuevos = [...archivos];
    const [item] = nuevos.splice(dragIndex.current, 1);
    nuevos.splice(idx, 0, item);
    onChange(nuevos);
    dragIndex.current = null;
    setDragOver(null);
  };
  const handleDragEnd = () => { dragIndex.current = null; setDragOver(null); };

  return (
    <div className="p-6 bg-black/40 rounded-xl border border-[#7c8d74]/30">
      <p className="text-[10px] font-black text-[#7c8d74] uppercase mb-2 tracking-widest text-center">Organizar láminas</p>
      <p className="text-[9px] text-zinc-500 text-center mb-6">Arrastra las imágenes para cambiar el orden</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {archivos.map((file, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className={`relative rounded-xl border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 select-none
              ${dragOver === idx ? 'border-[#7c8d74] scale-105 shadow-lg shadow-[#7c8d74]/20' : 'border-zinc-700'}`}
          >
            <img src={URL.createObjectURL(file)} className="w-full aspect-square object-cover" alt={`lámina ${idx + 1}`} draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#7c8d74]">{idx + 1}</span>
            </div>
            <div className="absolute top-2 right-2 text-zinc-400"><GripVertical size={14} /></div>
            <p className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-zinc-300 truncate px-2">{file.name}</p>
            {dragOver === idx && <div className="absolute inset-0 border-2 border-[#7c8d74] rounded-xl bg-[#7c8d74]/10" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esVoluntario, setEsVoluntario] = useState(false);
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [archivosOrdenados, setArchivosOrdenados] = useState<File[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [urlsExistentes, setUrlsExistentes] = useState<string[]>([]);
  const [miniaturaExistente, setMiniaturaExistente] = useState('');

  const inputMiniaturaRef = useRef<HTMLInputElement>(null);
  const inputLaminasRef = useRef<HTMLInputElement>(null);
  const inputVideoThumbRef = useRef<HTMLInputElement>(null);

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
  const [refrescarStorage, setRefrescarStorage] = useState(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'success') setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => { fetchProyectos(); fetchVideos(); }, []);

  async function fetchProyectos() {
    const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
    if (data) setProyectos(data);
  }

  async function fetchVideos() {
    const { data } = await supabase.from('videos_proyectos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  }

  const cleanFileName = (name: string) => name.replace(/[^a-zA-Z0-9.]/g, '_');

  const resetInputs = () => {
    if (inputMiniaturaRef.current) inputMiniaturaRef.current.value = '';
    if (inputLaminasRef.current) inputLaminasRef.current.value = '';
  };
  const resetInputsVideo = () => { if (inputVideoThumbRef.current) inputVideoThumbRef.current.value = ''; };

  const prepararEdicion = (p: any) => {
    setEditandoId(p.id); setNombre(p.nombre); setDescripcion(p.descripcion);
    setEsVoluntario(p.es_voluntario || false); setMiniaturaExistente(p.miniatura_url);
    setUrlsExistentes(p.infografias || []); setArchivosOrdenados([]);
    resetInputs(); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null); setNombre(''); setDescripcion(''); setEsVoluntario(false);
    setMiniaturaExistente(''); setUrlsExistentes([]); setArchivosOrdenados([]);
    setMiniatura(null); setProgreso(0); resetInputs();
  };

  const prepararEdicionVideo = (v: any) => {
    setEditandoVideoId(v.id); setVideoTitulo(v.titulo); setVideoUrl(v.youtube_url);
    setVideoThumbExistente(v.url_miniatura); setVideoThumb(null); resetInputsVideo();
  };

  const cancelarEdicionVideo = () => {
    setEditandoVideoId(null); setVideoTitulo(''); setVideoUrl('');
    setVideoThumbExistente(''); setVideoThumb(null); setProgreso(0); resetInputsVideo();
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return showToast('Nombre obligatorio', 'error');
    setCargando(true); setProgreso(0);
    try {
      const totalPasos = (miniatura ? 1 : 0) + archivosOrdenados.length;
      let pasoActual = 0;
      const avanzar = () => { pasoActual++; setProgreso(Math.round((pasoActual / totalPasos) * 100)); };

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

      const nuevasUrls: string[] = [];
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

      const payload = { nombre, descripcion, es_voluntario: esVoluntario, miniatura_url: urlFinalMiniatura, infografias: [...urlsExistentes, ...nuevasUrls] };
      if (editandoId) { await supabase.from('proyectos').update(payload).eq('id', editandoId); }
      else { if (!miniatura) throw new Error('Miniatura obligatoria'); await supabase.from('proyectos').insert([payload]); }

      showToast('¡Proyecto sincronizado con éxito!', 'success');
      cancelarEdicion(); fetchProyectos();
      setRefrescarStorage(r => r + 1);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setCargando(false); setProgreso(0); setLabelProgreso(''); }
  };

  const handlePublicarVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitulo || !videoUrl) return showToast('Título y URL obligatorios', 'error');
    setCargando(true); setProgreso(0);
    try {
      let urlFinalThumb = videoThumbExistente;
      if (videoThumb) {
        setLabelProgreso('Comprimiendo miniatura...'); setProgreso(30);
        const comprimida = await comprimirImagen(videoThumb);
        setLabelProgreso('Subiendo miniatura...'); setProgreso(65);
        const thumbName = `${Date.now()}_vthumb_${cleanFileName(comprimida.name)}`;
        await supabase.storage.from('galeria').upload(thumbName, comprimida);
        const { data } = supabase.storage.from('galeria').getPublicUrl(thumbName);
        urlFinalThumb = data.publicUrl; setProgreso(100);
      }
      const payload = { titulo: videoTitulo, youtube_url: videoUrl, url_miniatura: urlFinalThumb };
      if (editandoVideoId) { await supabase.from('videos_proyectos').update(payload).eq('id', editandoVideoId); }
      else { if (!videoThumb) throw new Error('Miniatura de video obligatoria'); await supabase.from('videos_proyectos').insert([payload]); }
      showToast('¡Video guardado con éxito!', 'success');
      cancelarEdicionVideo(); fetchVideos();
      setRefrescarStorage(r => r + 1);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setCargando(false); setProgreso(0); setLabelProgreso(''); }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm('¿Eliminar permanentemente? Se borrarán los archivos del servidor.')) return;
    try {
      const getFileName = (url: string) => url.split('/').pop()?.split('?')[0];
      const files = [getFileName(thumbUrl), ...(infoUrls?.map(getFileName) || [])].filter(Boolean) as string[];
      if (files.length) await supabase.storage.from('galeria').remove(files);
      await supabase.from('proyectos').delete().eq('id', id);
      showToast('Proyecto eliminado', 'error'); fetchProyectos();
      setRefrescarStorage(r => r + 1);
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleBorrarVideo = async (id: string, thumbUrl: string) => {
    if (!confirm('¿Eliminar video permanentemente?')) return;
    try {
      const fileName = thumbUrl.split('/').pop()?.split('?')[0];
      if (fileName) await supabase.storage.from('galeria').remove([fileName]);
      await supabase.from('videos_proyectos').delete().eq('id', id);
      showToast('Video eliminado', 'error'); fetchVideos();
      setRefrescarStorage(r => r + 1);
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  return (
    <div className="p-4 md:p-12 bg-[#141512] min-h-screen text-zinc-100">
      <ToastCenter toasts={toasts} onRemove={removeToast} />
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-2xl font-black uppercase italic">KOH <span className="text-[#7c8d74]">ADMIN</span></h1>
          <p className="text-[10px] text-zinc-500 font-mono self-end">v3.0 — Storage</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
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
                    <input ref={inputMiniaturaRef} type="file" accept="image/png, image/jpeg" className="text-[10px]" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="p-4 bg-[#141512] border border-zinc-800">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Láminas (PNG/JPG)</label>
                    <p className="text-[9px] text-[#7c8d74] mb-2">↓ Se comprimen a &lt;500 KB automáticamente</p>
                    <input ref={inputLaminasRef} type="file" accept="image/png, image/jpeg" multiple className="text-[10px]" onChange={e => e.target.files && setArchivosOrdenados(Array.from(e.target.files))} />
                  </div>
                </div>

                {archivosOrdenados.length > 0 && (
                  <LaminasSorter archivos={archivosOrdenados} onChange={setArchivosOrdenados} />
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
                  <input ref={inputVideoThumbRef} type="file" accept="image/png, image/jpeg" className="text-[10px]" onChange={e => setVideoThumb(e.target.files?.[0] || null)} />
                </div>
                {cargando && <ProgressBar progreso={progreso} label={labelProgreso} />}
                <button disabled={cargando} className="w-full py-4 bg-red-900/20 hover:bg-red-900 border border-red-900 text-red-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-60">
                  {editandoVideoId ? 'GUARDAR CAMBIOS VIDEO' : 'PUBLICAR VIDEO'}
                </button>
              </form>
            </section>
          </div>

          {/* LISTADOS LATERALES */}
          <div className="lg:col-span-5 space-y-6">

            {/* STORAGE WIDGET */}
            <StorageWidget refrescar={refrescarStorage} />

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