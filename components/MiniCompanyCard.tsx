import { MiniCompanyItem } from '@/domain/miniCompanyItem';
import { formatMarketCapMillions } from '@/app/utils/ui/card';

type Props = {
  item: MiniCompanyItem;
  active?: boolean;
  onAnalyze?: (id: number) => void;
};

function Skeleton({ className }: { className?: string }) {
  return <div className={['bg-white/10', 'animate-pulse', 'rounded', className ?? ''].join(' ')} />;
}

export function MiniCompanyCard({ item, active = false, onAnalyze }: Props) {
  const change = item.changePct ?? null;
  const isUp = change != null ? change >= 0 : null; //change of stock price

  const hasPrice = Number.isFinite(item.price);
  const hasMarketCap = item.marketCap != null;
  const hasVariation = Number.isFinite(change);

  return (
    <div
      className={[
        'relative overflow-hidden',
        'w-[240px]',
        'rounded-3xl',
        'border border-white/15',
        'bg-white/[0.07]',
        'backdrop-blur-2xl',
        'shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
        'px-5 py-5',
        'text-left',
        'transition-all duration-300',
        active ? 'ring-1 ring-white/25 scale-[1.04]' : 'scale-[0.98]',
      ].join(' ')}
    >
      {/* Glass effect */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent' />
      <div className='pointer-events-none absolute -top-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-3xl' />

      {/* Logo */}
      <div className='flex items-center justify-center'>
        {item.logo ? (
          <div className='h-14 w-14 overflow-hidden flex items-center justify-center'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.logo}
              alt={`${item.name} logo`}
              className='h-12 w-12 object-contain rounded-2xl'
            />
          </div>
        ) : (
          <div className='h-14 w-14 overflow-hidden rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center'>
            <Skeleton className='h-6 w-6 rounded-full' />
          </div>
        )}
      </div>

      {/* Name */}
      <div className='mt-3 text-center'>
        <p className='text-sm font-semibold text-white/90 truncate'>{item.name}</p>
      </div>

      {/* Values */}
      <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
        <div className='rounded-xl bg-black/25 backdrop-blur-xl border border-white/10 px-3 py-2'>
          <p className='text-white/50'>Market cap</p>
          <div className='mt-1 text-white/90 font-mono'>
            {hasMarketCap ? (
              formatMarketCapMillions(item.marketCap ?? null)
            ) : (
              <Skeleton className='w-16 h-4' />
            )}
          </div>
        </div>

        <div className='rounded-xl bg-black/25 backdrop-blur-xl border border-white/10 px-3 py-2'>
          <p className='text-white/50'>Price</p>
          <div className='mt-1 text-white/90 font-mono'>
            {hasPrice ? `$${Number(item.price).toFixed(2)}` : <Skeleton className='w-12 h-4' />}
          </div>
        </div>

        <div className='col-span-2 rounded-xl bg-black/25 backdrop-blur-xl border border-white/10 px-3 py-2 flex items-center justify-between'>
          <p className='text-white/50'>Variation</p>

          {hasVariation ? (
            <p
              className={[
                'font-mono',
                isUp == null ? 'text-white/70' : isUp ? 'text-emerald-300' : 'text-rose-300',
              ].join(' ')}
            >
              {`${change! >= 0 ? '+' : ''}${change!.toFixed(2)}%`}
            </p>
          ) : (
            <Skeleton className='w-12 h-4' />
          )}
        </div>
      </div>
      <div className='mt-5 flex justify-center relative z-10'>
        <button
          type='button'
          onClick={() => onAnalyze?.(item.id)}
          className={[
            'h-10',
            'w-[75%]',
            'rounded-2xl',
            'relative z-10',
            // Stronger metallic gray gradient
            'bg-gradient-to-b from-zinc-300/40 via-zinc-700/80 to-zinc-900/90',
            'hover:from-zinc-200/60 hover:via-zinc-600/85 hover:to-zinc-900/95',
            // Sharper border for separation from card
            'border border-zinc-400/30',
            // More defined metallic sheen
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_28px_rgba(0,0,0,0.55)]',
            // Pressed effect
            'active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_rgba(0,0,0,0.6)]',
            // Text
            'text-xs tracking-wide font-semibold text-white',
            // Focus state
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/40',
            // Smooth transitions
            'transition-all duration-200',
          ].join(' ')}
        >
          Analyze
        </button>
      </div>
    </div>
  );
}
