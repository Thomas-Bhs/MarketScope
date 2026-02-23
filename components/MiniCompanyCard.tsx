import { MiniCompanyItem } from '@/domain/miniCompanyItem';
import { formatMarketCapMillions } from '@/app/utils/ui/card';

type Props = {
  item: MiniCompanyItem;
  active?: boolean;
};

export function MiniCompanyCard({ item, active = false }: Props) {
  const change = item.changePct ?? null;
  const isUp = change != null ? change >= 0 : null; //change of stock price

  return (
    <div
      className={[
        'w-[220px]',
        'rounded-2xl',
        'border border-white/10',
        'bg-white/5',
        'backdrop-blur-xl',
        'shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
        'px-4 py-4',
        'text-left',
        'transition-all duration-300',
        active ? 'ring-1 ring-white/20 scale-105' : 'scale-95',
      ].join(' ')}
    >
      {/* Logo */}
      <div className='flex items-center justify-center'>
        <div className='h-12 w-12 overflow-hidden rounded-2xl bg-white/10 flex items-center justify-center'>
          {item.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logo} alt={`${item.name} logo`} className='h-10 w-10 object-contain' />
          ) : (
            <span className='text-white/50 text-xs'>Logo</span>
          )}
        </div>
      </div>

      {/* Name */}
      <div className='mt-3 text-center'>
        <p className='text-sm font-semibold text-white/90 truncate'>{item.name}</p>
      </div>

      {/* Values */}
      <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
        <div className='rounded-xl bg-black/20 border border-white/10 px-3 py-2'>
          <p className='text-white/50'>Market cap</p>
          <p className='mt-1 text-white/90 font-mono'>
            {formatMarketCapMillions(item.marketCap ?? null)}
          </p>
        </div>

        <div className='rounded-xl bg-black/20 border border-white/10 px-3 py-2'>
          <p className='text-white/50'>Price</p>
          <p className='mt-1 text-white/90 font-mono'>
            {Number.isFinite(item.price) ? `$${Number(item.price).toFixed(2)}` : '—'}
          </p>
        </div>

        <div className='col-span-2 rounded-xl bg-black/20 border border-white/10 px-3 py-2 flex items-center justify-between'>
          <p className='text-white/50'>Variation</p>
          <p
            className={[
              'font-mono',
              isUp == null ? 'text-white/70' : isUp ? 'text-emerald-300' : 'text-rose-300',
            ].join(' ')}
          >
            {Number.isFinite(change)
              ? `${change >= 0 ? '+' : ''}${Number(change).toFixed(2)}%`
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
