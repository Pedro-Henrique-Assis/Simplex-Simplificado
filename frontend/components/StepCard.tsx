export default function StepCard({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="py-2">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-black/45">{eyebrow}</p>}
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <div className="mt-5 text-base leading-7 text-black/75">{children}</div>
    </section>
  );
}
