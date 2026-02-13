import { Award, Users, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: Award,
    title: 'Calidad Garantizada',
    description: 'Utilizamos los mejores materiales y las técnicas más avanzadas para asegurar resultados duraderos y de excelencia.',
  },
  {
    icon: Users,
    title: 'Equipo Profesional',
    description: 'Contamos con un equipo de expertos altamente cualificados y comprometidos con la perfección en cada detalle.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad Primero',
    description: 'Implementamos los más altos estándares de seguridad en todas nuestras obras para proteger a nuestro equipo y tu inversión.',
  },
  {
    icon: TrendingUp,
    title: 'Innovación Constante',
    description: 'Estamos siempre a la vanguardia de las nuevas tecnologías y métodos constructivos para ofrecer soluciones eficientes y modernas.',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
            Por Qué Elegirnos
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Nuestra dedicación y experiencia nos convierten en tu mejor aliado para materializar tus proyectos.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-none bg-transparent">
                <CardHeader className="items-center">
                  <div className="bg-accent text-accent-foreground p-4 rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  <CardDescription className="mt-2">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
