import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok, FaEnvelope } from "react-icons/fa6";


export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start">
            <Link href="#" className="flex items-center gap-2 mb-4" prefetch={false}>
              <Image src="/logoKOH.jpg" alt="Construcciones Avanzadas KOH Logo" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xl font-bold font-headline text-primary">
                Construcciones Avanzadas KOH
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Construyendo el futuro con bases sólidas y confianza.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-center">
            <h4 className="font-headline text-lg font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><Link href="#about" className="text-sm hover:text-primary" prefetch={false}>Quiénes Somos</Link></li>
              <li><Link href="#services" className="text-sm hover:text-primary" prefetch={false}>Servicios</Link></li>
              <li><Link href="#coverage" className="text-sm hover:text-primary" prefetch={false}>Cobertura</Link></li>
              <li><Link href="#projects" className="text-sm hover:text-primary" prefetch={false}>Nuestros Proyectos</Link></li>
              <li><Link href="#standards" className="text-sm hover:text-primary" prefetch={false}>Estándares</Link></li>
            </ul>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <h4 className="font-headline text-lg font-semibold mb-4">Contacto</h4>
            <div className="flex space-x-4">
                <Link href="https://www.facebook.com/profile.php?id=61559919665649&sk=about" aria-label="Facebook" className="text-muted-foreground transition-transform duration-300 hover:-translate-y-1" prefetch={false}><FaFacebookF className="h-6 w-6 text-[#1877F2]" /></Link>
                <Link href="https://www.instagram.com/construavanzakoh/" aria-label="Instagram" className="text-muted-foreground transition-transform duration-300 hover:-translate-y-1" prefetch={false}><FaInstagram className="h-6 w-6 text-[#E1306C]" /></Link>
                <Link href="https://wa.me/525581536176" aria-label="WhatsApp" className="text-muted-foreground transition-transform duration-300 hover:-translate-y-1" prefetch={false}><FaWhatsapp className="h-6 w-6 text-[#25D366]" /></Link>
                <Link href="#" aria-label="TikTok" className="text-muted-foreground transition-transform duration-300 hover:-translate-y-1" prefetch={false}><FaTiktok className="h-6 w-6 text-black" /></Link>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Link href="mailto:construccionesavanzadaskoh@gmail.com" aria-label="Gmail" className="text-muted-foreground transition-transform duration-300 hover:-translate-y-1" prefetch={false}>
                <FaEnvelope className="h-6 w-6 text-[#D44638]" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
           <p>&copy; {year} Construcciones Avanzadas KOH. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
