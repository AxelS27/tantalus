import { memo, useState } from 'react';
import { Github, Linkedin, Mail, MessageCircle, Instagram, ChevronDown } from 'lucide-react';
import LegalModal, { type LegalTab } from './LegalModal';

interface FooterProps {
  className?: string;
}

function XOutlineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 3h4l12 18h-4L4 3Z" />
      <path d="M20 3 4 21" />
    </svg>
  );
}

const contactLinks = [
  { name: 'GitHub', href: 'https://github.com/AxelS27', icon: Github },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/axels27', icon: Linkedin },
  { name: 'Email', href: 'mailto:farrellaxel2006@gmail.com', icon: Mail },
  { name: 'WhatsApp', href: 'https://wa.me/liemaxels', icon: MessageCircle },
  { name: 'Instagram', href: 'https://instagram.com/liemaxels', icon: Instagram },
  { name: 'X', href: 'https://x.com/liemaxels', icon: XOutlineIcon },
];

const navigationGroups = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '/#' },
      { label: 'Timeline', href: '/#timeline' },
      { label: 'Projects', href: '/#projects' },
      { label: 'Archive', href: '/#archive' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Repertoire', href: '/#repertoire' },
      { label: 'Watchlist', href: '/#watchlist' },
      { label: 'Story Book', href: '/#storybook' },
      { label: 'Certificates', href: '/#certificates' },
      { label: 'Connect', href: '/#connect' },
    ],
  },
];

export const Footer = memo(function Footer({ className = '' }: FooterProps) {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const closeLegal = () => {
    setIsLegalOpen(false);
  };

  return (
    <>
      <footer
        className={`relative w-full bg-[#FAF8F5]/90 dark:bg-[#121110]/95 backdrop-blur-2xl backdrop-saturate-[180%] border-t border-stone-200/80 dark:border-stone-800/80 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.25)] px-4 sm:px-12 md:px-16 pt-8 md:pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-12 select-text z-20 ${className}`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 border-b border-stone-300/60 dark:border-stone-800 pb-5 md:pb-8">
          {/* Col 1: Identity */}
          <div className="order-1 md:order-none space-y-2 text-center md:text-left">
            <h3 className="font-serif italic text-[28px] sm:text-3xl text-stone-950 dark:text-stone-100 font-semibold leading-tight">
              Farrell Axel Suwandi
            </h3>
            <p className="font-serif italic text-xs sm:text-sm text-[#9E6F18] dark:text-[#E8C582] font-medium">
              AI Researcher & Software Engineer
            </p>
            <p className="hidden md:block font-sans text-xs text-stone-600 dark:text-stone-400 leading-relaxed pt-1 max-w-sm">
              Exploring agentic AI systems, spatial computing, and classical artistic expressions.
            </p>
          </div>

          {/* Col 2: Canvas & Archive navigation */}
          <nav aria-label="Footer navigation" className="order-3 md:order-none min-w-0">
            <div className="grid grid-cols-2 gap-4 md:hidden border-t border-stone-300/60 dark:border-stone-800">
              {navigationGroups.map(({ title, links }) => (
                <details key={title} className="group min-w-0">
                  <summary className="flex min-h-12 items-center justify-between gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-sans text-[11px] uppercase tracking-[0.14em] font-medium text-stone-600 dark:text-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
                    {title}
                    <ChevronDown aria-hidden="true" className="w-3.5 h-3.5 text-stone-400 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col pb-1 font-serif italic text-base text-stone-900 dark:text-stone-200">
                    {links.map(({ label, href }) => (
                      <a key={label} href={href} className="flex min-h-11 items-center hover:text-amber-800 dark:hover:text-[#FFD88A] transition-colors focus-visible:outline-2 focus-visible:outline-amber-700">{label}</a>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 sm:gap-6">
              {navigationGroups.map(({ title, links }) => (
                <div key={title} className="space-y-3 min-w-0">
                  <h4 className="font-sans text-xs sm:text-[13px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">{title}</h4>
                  <div className="flex flex-col items-start gap-2 text-sm sm:text-base font-serif italic text-stone-900 dark:text-stone-200">
                    {links.map(({ label, href }) => (
                      <a key={label} href={href} className="hover:text-amber-800 dark:hover:text-[#FFD88A] hover:translate-x-0.5 transition-all">{label}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Col 3: Social & Connect */}
          <div className="order-2 md:order-none space-y-3 md:col-span-2 lg:col-span-1">
            <h4 className="hidden md:block font-sans text-xs sm:text-[13px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
              Connect
            </h4>
            <div className="grid grid-cols-6 gap-1 max-w-xs mx-auto md:max-w-none md:mx-0 md:flex md:flex-wrap md:gap-2.5 pt-0.5">
              {contactLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  aria-label={name}
                  title={name}
                  className="inline-flex min-h-11 md:min-h-0 items-center justify-center gap-2 md:px-3.5 md:py-2 rounded-full md:rounded-xl bg-black/[0.035] md:bg-black/5 dark:bg-white/[0.06] md:dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/[0.07] md:border-black/10 dark:border-white/10 text-xs sm:text-sm font-sans font-medium text-stone-900 dark:text-stone-100 transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                >
                  <Icon className="w-4 h-4 shrink-0 text-stone-600 dark:text-stone-300" />
                  <span className="hidden md:inline">{name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="max-w-6xl mx-auto pt-4 md:pt-5 flex flex-col md:flex-row items-center justify-between text-[11px] font-sans text-stone-500 dark:text-stone-400 gap-1 md:gap-3">
          <p>
            © {new Date().getFullYear()} Farrell Axel Suwandi.
          </p>
          <div className="flex items-center gap-3.5 text-[11px] font-sans text-stone-500 dark:text-stone-400">
            <button
              onClick={() => openLegal('privacy')}
              className="min-h-11 md:min-h-0 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            >
              Privacy Policy
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <button
              onClick={() => openLegal('terms')}
              className="min-h-11 md:min-h-0 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Modal for Privacy Policy and Terms of Service */}
      <LegalModal
        isOpen={isLegalOpen}
        initialTab={legalTab}
        onClose={closeLegal}
      />
    </>
  );
});

export default Footer;
