export function Footer() {
  return (
    <footer className='-mx-4 mt-12 sm:mt-14 border-t border-white/10 bg-[#0D0D0F] px-6 py-6 sm:py-8'>
      <div className='mx-auto w-full max-w-[1100px]'>
        <div className='grid gap-6 sm:gap-8 sm:grid-cols-2 items-start'>
          {/* Brand */}
          <div>
            <p className='text-sm font-semibold text-white'>MarketScope</p>
            <p className='mt-2 text-sm text-white/60 leading-relaxed'>
              Explore the full technical breakdown and stack details in the project README on
              GitHub.
            </p>
          </div>

          {/* Links */}
          <div className='sm:text-right sm:ml-auto'>
            <p className='text-sm font-semibold text-white flex-end'>Links</p>
            <div className='mt-3 flex gap-2 sm:items-end'>
              <a
                href='https://github.com/Thomas-Bhs/marketscope'
                target='_blank'
                rel='noreferrer'
                className='text-sm text-white/70 hover:text-white transition'
              >
                GitHub
              </a>
              <a
                href='https://www.linkedin.com/in/thomas-bourc-his-09b056b4/'
                target='_blank'
                rel='noreferrer'
                className='text-sm text-white/70 hover:text-white transition'
              >
                LinkedIn
              </a>
              <a
                href='mailto:bourchisthomas@gmail.com'
                className='text-sm text-white/70 hover:text-white transition'
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className='mt-8 border-t border-white/10 pt-4 text-xs text-white/40 flex justify-between'>
          <p>© {new Date().getFullYear()} MarketScope</p>
          <p>Built by Thomas Bourchis</p>
        </div>
      </div>
    </footer>
  );
}
