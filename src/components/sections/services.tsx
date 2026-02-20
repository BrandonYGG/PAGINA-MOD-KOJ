import { 
  Home, Building, Wrench, Factory, ShoppingBag, 
  HardHat, Paintbrush, Box, Layout, FileSpreadsheet, Map, Zap, Droplets, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const services = [
  {
    icon: Factory,
    title: 'Proyectos Industriales',
    description: 'Diseño y construcción de fábricas, bodegas y almacenes. Incluye instalaciones eléctricas industriales, instalaciones hidráulicas e instalaciones sanitarias de alta capacidad.',
    imageId: 'service-industrial',
  },
  {
    icon: Building,
    title: 'Residencial y Habitacional',
    description: 'Casas y edificios departamentales. Proyectos integrales que incluyen cimentación, instalaciones eléctricas, instalaciones hidráulicas, instalaciones sanitarias y acabados.',
    imageId: 'service-residential',
  },
  {
    icon: ShoppingBag,
    title: 'Comercial y Oficinas',
    description: 'Estudios, clínicas, locales y estacionamientos. Realizamos toda la infraestructura de instalaciones eléctricas, hidráulicas y sanitarias para asegurar la funcionalidad del inmueble.',
    imageId: 'service-commercial',
  },
  {
    icon: HardHat,
    title: 'Infraestructura y Obra Civil',
    description: 'Urbanización. Drenaje. Redes hidráulicas. Alumbrado público. Parques deportivos. Pavimentos estampados. Instalaciones eléctricas de baja y media tensión.',
    imageId: 'service-civil',
  },
  {
    icon: Paintbrush,
    title: 'Diseño de Interiores',
    description: 'Transformación de espacios con acabados de alta gama y diseño conceptual, operando con equipo técnico en toda la República Mexicana y el extranjero.',
    imageId: 'service-interiors',
  },
  {
    icon: Wrench,
    title: 'Remodelaciones y Mantenimiento',
    description: 'Remodelaciones de cualquier proyecto. Mantenimiento por contrato anual para inmuebles. Garantía técnica acorde a las necesidades específicas de cada obra.',
    imageId: 'service-renovation',
  },
  {
    icon: Map,
    title: 'Levantamientos y Topografía',
    description: 'Servicios de levantamiento arquitectónico y topográfico de precisión. Realizamos el levantamiento de terrenos o cualquier inmueble en general para proyectos ejecutivos.',
    imageId: 'service-topography',
  },
  {
    icon: Layout,
    title: 'Proyectos 3D y VR',
    description: 'Modelado 3D y Realidad Virtual (VR). Modelado de proyecto con costo por m² según ubicación. Incluye un mínimo de 3 renders profesionales para visualización.',
    imageId: 'service-vr',
  },
  {
    icon: FileSpreadsheet,
    title: 'Gestión y Licitaciones',
    description: 'Elaboración de presupuestos de proyectos, catálogos de conceptos por partidas generales, generadores de obra y licitaciones para obra pública o privada.',
    imageId: 'service-docs',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary uppercase tracking-tight">
            Nuestras Especialidades
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Soluciones integrales de construcción e ingeniería. Desde el diseño conceptual hasta la ejecución de instalaciones técnicas y mantenimiento especializado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="flex flex-col h-full overflow-hidden shadow-md border-none transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="flex-row items-center gap-4 pb-2">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-headline text-lg leading-tight uppercase italic">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}