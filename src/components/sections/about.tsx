
export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-1 gap-8 md:gap-12 items-center">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
              Quiénes Somos
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto md:mx-0">
              ¡Tenemos una basta experiencia! Hacemos tus sueños realidad, nos especializamos en el diseño arquitectónico y la construcción, nuestro trabajo nos define, garantizando nuestra estabilidad por generaciones.
            </p>
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="font-headline font-semibold text-xl">Misión</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto md:mx-0">
                  Ejecutar proyectos de construcción de alta calidad que no solo cumplan con las especificaciones técnicas, sino que también contribuyan positivamente al entorno y a la vida de las personas.
                </p>
              </div>
              <div>
                <h3 className="font-headline font-semibold text-xl">Valores</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto md:mx-0">
                  Integridad, Innovación, Seguridad y Satisfacción del Cliente son los pilares que guían cada una de nuestras acciones y decisiones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
