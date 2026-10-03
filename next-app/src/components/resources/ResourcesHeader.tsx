interface ResourcesHeaderProps {
  title: string;
  description: string;
}

export function ResourcesHeader({ title, description }: ResourcesHeaderProps) {
  return (
    <section className="pt-16 pb-10 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 text-center">
        <p className="text-teal text-xs font-semibold uppercase tracking-[0.18em] mb-3">
          Resources
        </p>
        <h1 className="font-serif text-3xl lg:text-4xl font-medium text-ink mb-4">
          {title}
        </h1>
        <p className="text-ink-dim text-base leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
