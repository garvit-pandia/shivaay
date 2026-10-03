interface ResourcesHeaderProps {
  title: string;
  description: string;
}

export function ResourcesHeader({ title, description }: ResourcesHeaderProps) {
  return (
    <section className="relative pt-16 pb-12 bg-cream overflow-hidden">
      <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1280px] px-6">
        <p className="mono-label text-[11px] text-teal mb-4">
          Resources
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-ink-dim text-base leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
    </section>
  );
}
