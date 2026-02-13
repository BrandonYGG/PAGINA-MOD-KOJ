import { ClipboardCheck, HardHat, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const standards = [
  {
    icon: ClipboardCheck,
    title: 'Normativas Vigentes',
    description: 'Operamos en estricto apego a las Normas Oficiales Mexicanas (NOM) y reglamentos de construcción locales e internacionales.',
  },
  {
    icon: HardHat,
    title: 'Seguridad Laboral',
    description: 'Priorizamos la seguridad de nuestro personal y de todas las partes involucradas, implementando protocolos rigurosos en cada obra.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantía de Calidad',
    description: 'Aseguramos la excelencia mediante el uso de materiales certificados y procesos constructivos probados para la máxima durabilidad.',
  },
];

export default function Standards() {
  return (
    <section id="standards" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
            Estándares y Calidad
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Nuestro compromiso es construir con integridad, seguridad y los más altos estándares de la industria.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {standards.map((standard, index) => {
            const Icon = standard.icon;
            return (
              <Card key={index} className="text-center p-6">
                <CardHeader className="flex flex-col items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full">
                        <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="font-headline text-xl">{standard.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{standard.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
