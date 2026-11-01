// The pattern every landing section starts with (DESIGN.md Layout):
// big Bubblegum headline, one short Figtree line. No eyebrow label above it.

export function SectionHeading({ title, sub }: { title: React.ReactNode; sub: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] text-navy">{title}</h2>
      <p className="mt-sm max-w-[30rem] text-[1.0625rem] leading-relaxed text-navy-body">{sub}</p>
    </div>
  );
}
