'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Trash2, Plus, Video, Image as ImageIcon, HardHat, X, Edit2, AlertCircle } from 'lucide-react';

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
    setNombre('');
    setDescripcion('');
    setEsVoluntario(false);
    setMiniaturaExistente('');
    setUrlsExistentes([]);
    setArchivosOrdenados([]);
  };

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

      alert("¡Éxito!");
      cancelarEdicion();
      fetchProyectos();
    } catch (err: any) { alert(err.message); } finally { setCargando(false); }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Eliminar?")) return;
    try {
      const getFileName = (url: string) => url.split('/').pop();
      const files = [getFileName(thumbUrl), ...(infoUrls?.map(getFileName) || [])].filter(Boolean) as string[];
      if (files.length) await supabase.storage.from('galeria').remove(files);
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-4 md:p-12 bg-[#141512] min-h-screen text-zinc-100">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-2xl font-black uppercase italic">KOH <span className="text-[#7c8d74]">ADMIN</span></h1>
          {editandoId && <button onClick={cancelarEdicion} className="bg-blue-600 px-4 py-1 rounded text-[10px] font-bold">CANCELAR EDICIÓN</button>}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-[#1c1e1a] p-8 rounded-xl border border-zinc-800">
              <form onSubmit={handlePublicar} className="space-y-6">
                <input type="text" placeholder="NOMBRE" className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm" value={nombre} onChange={e => setNombre(e.target.value)} />
                <textarea placeholder="DESCRIPCIÓN" rows={3} className="w-full bg-[#141512] border-zinc-800 border p-4 text-sm" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                
                {/* CHECKBOX LEGAL */}
                <div className="flex items-center gap-3 p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg">
                  <input type="checkbox" id="vol" className="w-5 h-5 accent-[#7c8d74]" checked={esVoluntario} onChange={e => setEsVoluntario(e.target.checked)} />
                  <label htmlFor="vol" className="text-xs font-bold uppercase cursor-pointer">¿Es anteproyecto voluntario / apoyo académico?</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#141512] border border-zinc-800">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Portada</label>
                    <input type="file" className="text-[10px]" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
                  </div>
                  <div className="p-4 bg-[#141512] border border-zinc-800">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-2">Añadir Galería</label>
                    <input type="file" multiple className="text-[10px]" onChange={e => e.target.files && setArchivosOrdenados(Array.from(e.target.files))} />
                  </div>
                </div>

                {urlsExistentes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded">
                    {urlsExistentes.map((url, i) => (
                      <div key={i} className="relative group w-16 h-16">
                        <img src={url} className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={() => setUrlsExistentes(urlsExistentes.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                )}

                <button disabled={cargando} className="w-full py-4 bg-[#7c8d74] text-white font-black text-xs uppercase tracking-widest">{cargando ? 'PROCESANDO...' : 'GUARDAR PROYECTO'}</button>
              </form>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Portafolio Activo</h3>
            {proyectos.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-[#1c1e1a] p-4 border border-zinc-800 rounded-lg group">
                <div className="flex items-center gap-3">
                  <img src={p.miniatura_url} className="w-10 h-10 object-cover rounded" />
                  <span className="text-xs font-bold uppercase truncate w-32">{p.nombre}</span>
                  {p.es_voluntario && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">VOL</span>}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => prepararEdicion(p)} className="p-2 text-zinc-400 hover:text-white"><Edit2 size={16}/></button>
                  <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}