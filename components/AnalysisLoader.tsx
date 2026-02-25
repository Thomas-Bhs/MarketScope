import Image from 'next/image';

type Props = {
  label?: string;
};

export function AnalysisLoader({ label = 'Analyzing company data' }: Props) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      {/* Logo bubble */}
      <div className="h-20 w-20 rounded-full bg-black flex items-center justify-center shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="relative h-12 w-12">
          <Image
            src="/logo_marketscope.png"
            alt="MarketScope"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>


      <div className="mt-6 text-sm sm:text-base text-black/70 font-medium">
        {label}
        <span className="inline-flex w-[24px] justify-start">
          <span className="ms-dot">.</span>
          <span className="ms-dot ms-dot--2">.</span>
          <span className="ms-dot ms-dot--3">.</span>
        </span>
      </div>
    </div>
  );
}