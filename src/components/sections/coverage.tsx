import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const coverageAreas = [
  'Texcoco', 'Ixtapaluca', 'Los Reyes', 'Iztapalapa', 'Tláhuac',
  'Valle de Chalco', 'Chalco de Díaz Covarrubias', 'Cocotitlán', 'Temamatla',
  'Juchitepec', 'Ayapango', 'Amecameca', 'Xochimilco', 'Mixquic', 'Canal de Chalco',
  'Calz. Miramontes', 'Coapa', 'Coyoacán', 'Tlalpan', 'Morelos', 'Puebla',
  'Y muchos más (incluyendo el extranjero)'
];

export default function Coverage() {
  return (
    <section id="coverage" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
            Nuestra Zona de Cobertura
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Llevamos nuestros servicios de construcción a una amplia región, garantizando calidad y compromiso en cada proyecto.
          </p>
        </div>
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="md:col-span-2 relative aspect-square">
            <Image 
              src="https://i.postimg.cc/PrV9Xs7k/C2B13881-72A6-4DAA-BD57-1912690F6B3B.png"
              alt="Mapa del Estado de México"
              fill
              className="object-cover rounded-lg shadow-lg"
              data-ai-hint="mexico state map"
            />
          </div>
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Áreas de Servicio Principales</CardTitle>
                <CardDescription>
                  Ofrecemos nuestros servicios en las siguientes localidades y sus alrededores:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="columns-2 sm:columns-3 text-muted-foreground space-y-2">
                  {coverageAreas.map((area, index) => (
                    <li key={`${area}-${index}`} className="break-inside-avoid">{area}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
