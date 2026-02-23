'use client';

import { useEffect, useRef, useState } from 'react';
import { CompanyCard } from '@/components/CompanyCard';
import { Company } from '@/domain/company';
import { MiniCompanyCard } from './MiniCompanyCard';

type Props = {
  companies: Company[];
};

export function CompanyCarousel({ companies }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.children) as HTMLElement[];
      //calculate the center of the carousel container
      const containerCenter = container.scrollLeft + container.offsetWidth / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      //calculate which card is closest to the center
      children.forEach((child, index) => {
        //calculate the center of the card
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(containerCenter - childCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener('scroll', handleScroll);
    //cleanup when component unmounts
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (!companies.length) return null;

  return (
    <div className='relative -mx-4'>
      
      <div className='pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/60 to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/60 to-transparent' />

      <div
        ref={containerRef}
        className='
          flex gap-4 overflow-x-auto px-4 pb-4
          snap-x snap-mandatory
          [-webkit-overflow-scrolling:touch]
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        '
      >
        {companies.map((company, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={company.id}
              className={`
                snap-center shrink-0
                w-[86%] sm:w-[70%]
                transition-all duration-300
                ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60'}
              `}
            >
              <CompanyCard company={company} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
