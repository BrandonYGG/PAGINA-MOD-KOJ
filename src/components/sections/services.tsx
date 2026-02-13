
import { Home, Building, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const services = [
  {
    icon: Home,
    title: 'Construcción Residencial',
    description: 'Creamos hogares a medida, combinando diseño innovador con funcionalidad y confort para tu familia.',
    imageId: 'service-residential',
  },
  {
    icon: Building,
    title: 'Proyectos Comerciales',
    description: 'Desarrollamos espacios comerciales y de oficinas que impulsan el crecimiento de tu negocio.',
    imageId: 'service-commercial',
  },
  {
    icon: Wrench,
    title: 'Renovaciones y Reformas',
    description: 'Modernizamos y transformamos tus espacios existentes, mejorando su valor y funcionalidad.',
    imageId: 'service-renovation',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
            Nuestros Servicios
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Ofrecemos una gama completa de servicios de construcción para satisfacer todas tus necesidades.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="flex flex-col overflow-hidden shadow-lg transform transition-transform duration-300 hover:-translate-y-2">
                <CardHeader className="flex-row items-center gap-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
