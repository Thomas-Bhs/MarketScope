'use client';

import { useEffect, useRef, useState } from 'react';
import { MiniCompanyCard } from './MiniCompanyCard';
import { MiniCompanyItem } from '@/domain/miniCompanyItem';
import { getCoverflowStyle } from '@/app/utils/ui/carousel';

type Props = {
  items: MiniCompanyItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAnalyze: (id: number) => void;
};

export function CompanyCarousel({ items, selectedId, onSelect, onAnalyze }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Parent -> Carousel : when selectedId changes (e.g. from filter), update activeIndex to match
  useEffect(() => {
    if (selectedId == null) return;
    const idx = items.findIndex((it) => it.id === selectedId);
    if (idx >= 0) setActiveIndex(idx);
  }, [selectedId, items]);

  // Carousel -> Parent : when activeIndex changes (e.g. from scroll), notify parent of new selectedId
  useEffect(() => {
    const it = items[activeIndex];
    if (!it) return;

    // avoid spamming onSelect during fast scroll - wait a bit before confirming selection
    const t = setTimeout(() => onSelect(it.id), 120);
    return () => clearTimeout(t);
  }, [activeIndex, items, onSelect]);

  //scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;

    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(container.children) as HTMLElement[];

        // center of the container in coordinates "layout" (IGNORE transforms)
        const containerCenter = container.scrollLeft + container.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        children.forEach((child, index) => {
          // center of the child in the same "layout" coordinates
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const distance = Math.abs(containerCenter - childCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll); //recalculate on window rezise

    handleScroll(); //initial calculation

    //cleanup when component unmounts
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length]); //re-run effect if companies list changes

  if (!items.length) return null;

  return (
    <div className='relative mx-auto w-full max-w-[720px] [perspective:1200px]'>
      <div className='pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/60 to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/60 to-transparent' />

      <div
        ref={containerRef}
        className='
          relative flex items-center gap-1
          overflow-x-auto scroll-smooth
          snap-x snap-mandatory
          [-webkit-overflow-scrolling:touch]
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          [transform-style:preserve-3d]
          pt-8 pb-16
          px-[22%]
          '
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={item.id}
              style={getCoverflowStyle(index, activeIndex)}
              className='snap-center shrink-0 w-[70%] sm:w-[52%] -ml-3 first:ml-0 transition-transform duration-300 will-change-transform'
            >
              <MiniCompanyCard item={item} active={isActive} onAnalyze={onAnalyze} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
