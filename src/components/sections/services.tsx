import { 
  Home, Building, Wrench, Factory, ShoppingBag, 
  HardHat, Paintbrush, Box, Layout, FileSpreadsheet, Map 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const services = [
  {
    icon: Factory,
    title: 'Proyectos Industriales',
    description: 'Diseño y construcción de fábricas, bodegas y complejos de almacenamiento optimizados para la logística industrial.',
    imageId: 'service-industrial',
  },
  {
    icon: Home,
    title: 'Residencial y Habitacional',
    description: 'Casas y edificios departamentales. Cubrimos desde la cimentación e interiores hasta el mantenimiento preventivo de la obra.',
    imageId: 'service-residential',
  },
  {
    icon: Building,
    title: 'Comercial y Oficinas',
    description: 'Estudios, clínicas, locales y estacionamientos diseñados para maximizar la funcionalidad de tu inversión.',
    imageId: 'service-commercial',
  },
  {
    icon: HardHat,
    title: 'Infraestructura y Obra Civil',
    description: 'Urbanización, drenaje, redes hidráulicas, alumbrado público, parques y pavimentos estampados.',
    imageId: 'service-civil',
  },
  {
    icon: Paintbrush,
    title: 'Diseño de Interiores',
    description: 'Transformación de espacios con acabados de alta gama, operando en toda la República Mexicana y el extranjero.',
    imageId: 'service-interiors',
  },
  {
    icon: Wrench,
    title: 'Remodelaciones Integrales',
    description: 'Actualización de cualquier proyecto con garantía de mantenimiento acorde a las necesidades específicas de la obra.',
    imageId: 'service-renovation',
  },
  {
    icon: Map,
    title: 'Levantamientos y Topografía',
    description: 'Servicios de levantamiento arquitectónico y topográfico de precisión para terrenos y cualquier tipo de inmueble.',
    imageId: 'service-topography',
  },
  {
    icon: Layout,
    title: 'Proyectos 3D y VR',
    description: 'Modelado en 3D y Realidad Virtual con costos por m² según ubicación. Incluye un mínimo de 3 renders profesionales.',
    imageId: 'service-vr',
  },
  {
    icon: FileSpreadsheet,
    title: 'Gestión y Licitaciones',
    description: 'Elaboración de presupuestos, catálogos de conceptos por partidas y generadores para obra privada o civil.',
    imageId: 'service-docs',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary uppercase tracking-tight">
            Nuestros Servicios
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Soluciones integrales de construcción, desde el diseño conceptual y realidad virtual hasta la ejecución y mantenimiento por contrato anual.
          </p>
        </div>
        {/* Cambié md:grid-cols-3 por lg:grid-cols-3 para que en pantallas medianas se vea mejor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="flex flex-col h-full overflow-hidden shadow-md border-none transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="flex-row items-center gap-4 pb-2">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-headline text-lg leading-tight">{service.title}</CardTitle>
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