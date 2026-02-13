'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AdminPage() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [miniatura, setMiniatura] = useState<File | null>(null);
  const [infografias, setInfografias] = useState<FileList | null>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetchProyectos();
  }, []);

  async function fetchProyectos() {
    const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
    if (data) setProyectos(data);
  }

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !miniatura) return alert("Nombre y miniatura son obligatorios");
    setCargando(true);

    try {
      // 1. SUBIR MINIATURA
      const miniaturaName = `${Date.now()}_thumb_${miniatura.name}`;
      const { error: thumbError } = await supabase.storage.from('galeria').upload(miniaturaName, miniatura);
      
      if (thumbError) throw new Error(`Error en Miniatura: ${thumbError.message}`); // Detener si falla

      const { data: thumbData } = supabase.storage.from('galeria').getPublicUrl(miniaturaName);

      // 2. SUBIR INFOGRAFÍAS
      const infoUrls = [];
      if (infografias) {
        for (let i = 0; i < infografias.length; i++) {
          const file = infografias[i];
          const fileName = `${Date.now()}_info_${file.name}`;
          const { error: infoError } = await supabase.storage.from('galeria').upload(fileName, file);
          
          if (infoError) throw new Error(`Error en Galería: ${infoError.message}`); // Detener si falla
          
          const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
          infoUrls.push(data.publicUrl);
        }
      }

      // 3. INSERTAR EN TABLA (Solo si las fotos se subieron)
      const { error: dbError } = await supabase.from('proyectos').insert([
        { 
          nombre, 
          descripcion, 
          miniatura_url: thumbData.publicUrl, 
          infografias: infoUrls 
        }
      ]);

      if (dbError) throw dbError;

      alert("¡Proyecto publicado con éxito!");
      setNombre(''); 
      setDescripcion(''); 
      fetchProyectos();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al publicar"); // Ahora te dirá el error real
    } finally {
      setCargando(false);
    }
  };

  const handleBorrar = async (id: number, thumbUrl: string, infoUrls: string[]) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    try {
      const filesToDelete = [thumbUrl.split('/').pop()!];
      infoUrls.forEach(url => filesToDelete.push(url.split('/').pop()!));
      
      await supabase.storage.from('galeria').remove(filesToDelete);
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    } catch (err) {
      alert("Error al eliminar");
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
        
        <form onSubmit={handlePublicar} className="bg-[#242622] p-8 rounded-sm shadow-2xl mb-12 border-l-4 border-[#4a3424]">
          <div className="grid gap-6">
            <input type="text" placeholder="NOMBRE DEL PROYECTO" 
              className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none transition-colors" 
              value={nombre} onChange={e => setNombre(e.target.value)} />
            
            <textarea placeholder="DESCRIPCIÓN TÉCNICA" rows={4}
              className="w-full p-3 bg-[#2d302a] border border-zinc-700 focus:border-[#7c8d74] outline-none transition-colors"
              value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-zinc-800">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#7c8d74]">IMAGEN PRINCIPAL (MINIATURA)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#4a3424] file:text-white hover:file:bg-[#5d432d] cursor-pointer"
                  onChange={e => setMiniatura(e.target.files?.[0] || null)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#7c8d74]">GALERÍA (INFOGRAFÍAS)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#7c8d74] file:text-white hover:file:bg-[#8da184] cursor-pointer"
                  onChange={e => setInfografias(e.target.files)} 
                />
              </div>
            </div>

            <button disabled={cargando} 
              className="bg-[#4a3424] hover:bg-[#5d432d] text-white py-4 px-8 tracking-widest font-bold transition-all disabled:opacity-50 uppercase text-sm">
              {cargando ? 'PROCESANDO...' : 'PUBLICAR PROYECTO'}
            </button>
          </div>
        </form>

        <h2 className="text-xl font-bold mb-6 text-zinc-400">PROYECTOS ACTIVOS</h2>
        <div className="grid gap-4">
          {proyectos.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-[#242622] p-5 border border-zinc-800 hover:border-[#7c8d74] transition-colors group">
              <span className="font-medium tracking-wide">{p.nombre}</span>
              <button onClick={() => handleBorrar(p.id, p.miniatura_url, p.infografias)} 
                className="text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}