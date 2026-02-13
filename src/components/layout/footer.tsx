'use client';

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok, FaEnvelope } from "react-icons/fa6";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1c18] text-white py-12 border-t border-zinc-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Columna 1: Logo y Eslogan */}
          <div className="flex flex-col items-start space-y-4">
            <Link href="/" className="flex items-center gap-3 group" prefetch={false}>
              {/* Contenedor circular con fondo blanco para que el logo resalte */}
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-zinc-700 shadow-lg">
                <img 
                  src="/logoKOH.jpg" 
                  alt="Logo KOH" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-headline text-primary tracking-tight">
                  KOH <span className="text-zinc-400 font-light">Avanzadas</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              Construyendo el futuro con bases sólidas, ingeniería de vanguardia y la confianza de nuestros clientes.
            </p>
          </div>

          {/* Columna 2: Navegación Central */}
          <div className="flex flex-col items-start md:items-center">
            <h4 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-[#7c8d74] mb-6">Explorar</h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 md:flex md:flex-col md:items-center">
              <li><Link href="#about" className="text-sm text-zinc-400 hover:text-primary transition-colors">Nosotros</Link></li>
              <li><Link href="#services" className="text-sm text-zinc-400 hover:text-primary transition-colors">Servicios</Link></li>
              <li><Link href="#projects" className="text-sm text-zinc-400 hover:text-primary transition-colors">Proyectos</Link></li>
              <li><Link href="#standards" className="text-sm text-zinc-400 hover:text-primary transition-colors">Calidad</Link></li>
            </ul>
          </div>

          {/* Columna 3: Contacto y Redes */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-[#7c8d74] mb-6">Contacto Directo</h4>
            <div className="flex gap-4">
                <Link href="https://www.facebook.com/profile.php?id=61559919665649" target="_blank" className="p-3 bg-zinc-900 rounded-full hover:bg-[#1877F2] transition-all duration-300">
                  <FaFacebookF className="h-5 w-5" />
                </Link>
                <Link href="https://www.instagram.com/construavanzakoh/" target="_blank" className="p-3 bg-zinc-900 rounded-full hover:bg-[#E1306C] transition-all duration-300">
                  <FaInstagram className="h-5 w-5" />
                </Link>
                <Link href="https://wa.me/525581536176" target="_blank" className="p-3 bg-zinc-900 rounded-full hover:bg-[#25D366] transition-all duration-300">
                  <FaWhatsapp className="h-5 w-5" />
                </Link>
                <Link href="mailto:construccionesavanzadaskoh@gmail.com" className="p-3 bg-zinc-900 rounded-full hover:bg-[#D44638] transition-all duration-300">
                  <FaEnvelope className="h-5 w-5" />
                </Link>
            </div>
            <p className="mt-6 text-xs text-zinc-500 font-mono tracking-tighter">
              EDO. DE MÉXICO | CDMX | HIDALGO
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-900 mt-12 pt-8 text-center">
           <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            &copy; {year} Construcciones Avanzadas KOH. Todos los derechos reservados.
           </p>
        </div>
      </div>
    </footer>
  );
}