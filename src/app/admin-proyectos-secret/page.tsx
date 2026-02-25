'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AdminPage() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  
  // NUEVO: Estado para manejar la pre-visualización y orden antes de subir
  const [previsualizacionFiles, setPrevisualizacionFiles] = useState<File[]>([]);

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

  // Lógica para ordenar las fotos ANTES de subir
  const moverPrevisualizacion = (index: number, direccion: 'subir' | 'bajar') => {
    const nuevosFiles = [...previsualizacionFiles];
    const file = nuevosFiles.splice(index, 1)[0];
    const nuevaPos = direccion === 'subir' ? index - 1 : index + 1;
    nuevosFiles.splice(nuevaPos, 0, file);
    setPrevisualizacionFiles(nuevosFiles);
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !miniatura || previsualizacionFiles.length === 0) return alert("Faltan datos o imágenes");
    setCargando(true);

    try {
      // 1. Subir Miniatura Principal
      const miniaturaName = `${Date.now()}_thumb_${miniatura.name}`;
      const { error: thumbError } = await supabase.storage.from('galeria').upload(miniaturaName, miniatura);
      if (thumbError) throw thumbError;
      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(miniaturaName);

      // 2. Subir Galería en el ORDEN ELEGIDO
      const infoUrls = [];
      for (const file of previsualizacionFiles) {
        const fileName = `${Date.now()}_info_${file.name}`;
        const { error: infoError } = await supabase.storage.from('galeria').upload(fileName, file);
        if (infoError) throw infoError;
        const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
        infoUrls.push(data.publicUrl);
      }

      // 3. Guardar en DB
      const { error: dbError } = await supabase.from('proyectos').insert([
        { nombre, descripcion, miniatura_url: thumbData.publicUrl, infografias: infoUrls }
      ]);

      if (dbError) throw dbError;
      alert("¡Proyecto publicado con éxito!");
      setNombre(''); setDescripcion(''); setPrevisualizacionFiles([]);
      fetchProyectos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // RESTAURADO: Función de Borrado corregida
  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    try {
      const filesToDelete = [thumbUrl.split('/').pop()!];
      if (infoUrls) infoUrls.forEach(url => filesToDelete.push(url.split('/').pop()!));
      
      await supabase.storage.from('galeria').remove(filesToDelete);
      const { error } = await supabase.from('proyectos').delete().eq('id', id);
      if (error) throw error;
      fetchProyectos();
    } catch (err) { alert("Error al eliminar"); }
  };

  return (
    <div className="p-8 bg-[#1a1c18] min-h-screen text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 border-b border-[#7c8d74] pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-white">
            Panel <span className="text-[#7c8d74]">Admin Pro</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* SECCIÓN CARGA */}
          <section className="space-y-6">
            <h2 className="text-[#7c8d74] font-bold uppercase text-sm">Nuevo Proyecto</h2>
            <form onSubmit={handlePublicar} className="bg-[#242622] p-6 border-l-4 border-[#4a3424] space-y-4">
              <input type="text" placeholder="NOMBRE" className="w-full p-2 bg-[#2d302a] border border-zinc-700 outline-none" value={nombre} onChange={e => setNombre(e.target.value)} />
              
              <div className="space-y-2">
                <label className="text-[10px] text-[#7c8d74] font-bold">PASO 1: SELECCIONAR FOTOS DE GALERÍA</label>
                <input type="file" multiple accept="image/*" className="text-xs block" 
                  onChange={e => {
                    if(e.target.files) setPrevisualizacionFiles(Array.from(e.target.files));
                  }} 
                />
              </div>

              {/* AREA DE ORDENAMIENTO PREVIO */}
              {previsualizacionFiles.length > 0 && (
                <div className="bg-[#1a1c18] p-3 rounded space-y-2">
                  <p className="text-[10px] text-zinc-400 italic">Ordena las fotos antes de publicar:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {previsualizacionFiles.map((file, idx) => (
                      <div key={idx} className="relative bg-[#2d302a] p-1 border border-zinc-700">
                        <img src={URL.createObjectURL(file)} className="w-full h-16 object-cover" />
                        <div className="flex justify-between mt-1">
                          <button type="button" onClick={() => moverPrevisualizacion(idx, 'subir')} className="text-[10px] bg-zinc-800 px-1 disabled:opacity-0" disabled={idx === 0}>←</button>
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                          <button type="button" onClick={() => moverPrevisualizacion(idx, 'bajar')} className="text-[10px] bg-zinc-800 px-1 disabled:opacity-0" disabled={idx === previsualizacionFiles.length - 1}>→</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800">
                <label className="text-[10px] text-[#7c8d74] font-bold">PASO 2: IMAGEN DE PORTADA</label>
                <input type="file" accept="image/*" className="text-xs block mt-2" onChange={e => setMiniatura(e.target.files?.[0] || null)} />
              </div>

              <button disabled={cargando} className="w-full bg-[#4a3424] py-3 text-xs font-bold uppercase hover:bg-[#5d432d] transition-all">
                {cargando ? 'SUBIENDO...' : 'PUBLICAR PROYECTO'}
              </button>
            </form>
          </section>

          {/* LISTADO Y BORRADO */}
          <section className="space-y-6">
            <h2 className="text-[#7c8d74] font-bold uppercase text-sm">Proyectos Activos</h2>
            <div className="space-y-3">
              {proyectos.map(p => (
                <div key={p.id} className="bg-[#242622] p-4 flex justify-between items-center border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img src={p.miniatura_url} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <p className="text-xs font-bold uppercase">{p.nombre}</p>
                      <p className="text-[9px] text-zinc-500">{p.infografias?.length || 0} imágenes</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)}
                    className="bg-red-900/20 text-red-500 hover:bg-red-900 hover:text-white px-3 py-1 text-[10px] font-bold rounded transition-all"
                  >
                    BORRAR
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}