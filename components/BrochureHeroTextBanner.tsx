type Props = {
  /** Tarjeta en grid del paso 1 (más compacto). */
  compact?: boolean;
  lead: string;
  rest: string;
};

export function BrochureHeroTextBanner({ compact, lead, rest }: Props) {
  if (compact) {
    return (
      <div className="flex h-full w-full flex-col justify-center bg-gradient-to-br from-[#4749B6] via-[#5558c4] to-[#6366d1] px-5 py-6 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
          Agente · Corresponsal
        </p>
        <p className="mt-2 text-base font-bold leading-snug">{lead}</p>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/95">{rest}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#4749B6] via-[#5558c4] to-[#6366d1] px-6 py-12 text-white sm:px-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
        Agente · Corresponsal
      </p>
      <p className="mt-4 max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">{lead}</p>
      <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/95 sm:text-lg">
        {rest}
      </p>
    </div>
  );
}
