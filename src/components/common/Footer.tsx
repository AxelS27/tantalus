import { memo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import LegalModal, { type LegalTab } from './LegalModal';

interface FooterProps {
  className?: string;
}

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
        className={`relative w-full bg-[#FAF8F5]/90 dark:bg-[#121110]/95 backdrop-blur-2xl backdrop-saturate-[180%] border-t border-stone-200/80 dark:border-stone-800/80 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.25)] px-6 sm:px-12 md:px-16 pt-10 pb-12 select-text z-20 ${className}`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 border-b border-stone-300/60 dark:border-stone-800 pb-8">
          {/* Col 1: Identity */}
          <div className="space-y-2">
            <h3 className="font-serif italic text-2xl sm:text-3xl text-stone-950 dark:text-stone-100 font-semibold leading-tight">
              Farrell Axel Suwandi
            </h3>
            <p className="font-serif italic text-xs sm:text-sm text-[#9E6F18] dark:text-[#E8C582] font-medium">
              AI Researcher & Software Engineer
            </p>
            <p className="font-sans text-xs text-stone-600 dark:text-stone-400 leading-relaxed pt-1 max-w-sm">
              Exploring high-performance deep learning systems, spatial computing, and classical artistic expressions.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-sans text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-serif italic text-stone-800 dark:text-stone-300">
              <a href="/#" className="hover:text-amber-900 dark:hover:text-[#FFD88A] transition-colors">Home</a>
              <a href="/#timeline" className="hover:text-amber-900 dark:hover:text-[#FFD88A] transition-colors">Timeline</a>
              <a href="/#projects" className="hover:text-amber-900 dark:hover:text-[#FFD88A] transition-colors">Projects</a>
              <a href="/#archive" className="hover:text-amber-900 dark:hover:text-[#FFD88A] transition-colors">Archive</a>
            </div>
          </div>

          {/* Col 3: Social & Connect */}
          <div className="space-y-2.5">
            <h4 className="font-sans text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
              Connect
            </h4>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <a
                href="https://github.com/AxelS27"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-xs font-sans font-medium text-stone-900 dark:text-stone-100 transition-colors"
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3 text-stone-500 dark:text-stone-400" />
              </a>
              <a
                href="https://linkedin.com/in/farrell-axel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-xs font-sans font-medium text-stone-900 dark:text-stone-100 transition-colors"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-stone-500 dark:text-stone-400" />
              </a>
              <a
                href="mailto:contact@liemaxels.com"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-xs font-sans font-medium text-stone-900 dark:text-stone-100 transition-colors"
              >
                <span>Email</span>
                <ArrowUpRight className="w-3 h-3 text-stone-500 dark:text-stone-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="max-w-6xl mx-auto pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-stone-500 dark:text-stone-400 gap-3">
          <p>
            © 2026 Farrell Axel Suwandi. Built with React 19, Motion & Vite.
          </p>
          <div className="flex items-center gap-3.5 text-[11px] font-sans text-stone-500 dark:text-stone-400">
            <button
              onClick={() => openLegal('privacy')}
              className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <button
              onClick={() => openLegal('terms')}
              className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
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
