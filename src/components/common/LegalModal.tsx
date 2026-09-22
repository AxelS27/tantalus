import { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, X } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal = memo(function LegalModal({
  isOpen,
  initialTab = 'privacy',
  onClose,
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 md:p-8 select-text font-sans">
          {/* Ambient Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl h-[580px] sm:h-[620px] max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#FAF8F5] dark:bg-[#141210] border border-stone-200/80 dark:border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.45)] overflow-hidden text-stone-900 dark:text-stone-100 z-10"
          >
            {/* Top Navigation Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-200 dark:border-stone-800 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
              {/* Segmented Pill Tab Switcher */}
              <div className="flex items-center p-1 rounded-full bg-stone-200/60 dark:bg-white/10 text-xs font-sans font-medium">
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === 'privacy'
                      ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFD88A]" />
                  <span>Privacy Policy</span>
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === 'terms'
                      ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFD88A]" />
                  <span>Terms of Service</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                title="Close dialog"
                className="p-1.5 rounded-full bg-stone-200/70 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {activeTab === 'privacy' ? (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-stone-950 dark:text-white leading-tight mb-1">
                      Privacy Policy
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Last updated: February 2026
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      1. Overview & Commitment
                    </h4>
                    <p>
                      <strong>Tantalize</strong> is a personal editorial portfolio and interactive spatial software showcase curated by <strong>Farrell Axel Suwandi</strong>. We respect your digital privacy. This website does not monetize, sell, or rent your personal information to any third parties.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      2. Information Storage & Preferences
                    </h4>
                    <p>
                      All customized user preferences (such as light/dark mode selection, ambient sound volume, and motion quality presets) are retained exclusively on your local client device using standard browser <code>localStorage</code>. No persistent tracking cookies or cross-site profiling trackers are employed.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      3. External Links & Third-Party Services
                    </h4>
                    <p>
                      This portfolio includes direct hyperlinks to external platforms (including GitHub, LinkedIn, Vercel deployments, Canva, and Google Drive). Visiting these links places you under the independent privacy practices and terms of those respective providers.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      4. Inquiries
                    </h4>
                    <p>
                      For any questions or privacy concerns regarding this portfolio, feel free to reach out directly via email at <a href="mailto:contact@liemaxels.com" className="text-amber-800 dark:text-[#FFD88A] hover:underline font-medium">contact@liemaxels.com</a>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-stone-950 dark:text-white leading-tight mb-1">
                      Terms of Service
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Last updated: February 2026
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      1. Intellectual Property & Attribution
                    </h4>
                    <p>
                      All original UI architectures, interactive 2D spatial canvas designs, proprietary project narratives, and custom software source code presented on this site are the intellectual property of <strong>Farrell Axel Suwandi</strong> unless otherwise attributed.
                    </p>
                    <p>
                      Classical Renaissance artwork elements incorporated across the canvas quadrants are sourced from public domain historical works, adapted and composited for non-commercial editorial aesthetics.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      2. Permitted Use
                    </h4>
                    <p>
                      Visitors are granted a limited license to explore, view, and interact with the portfolio for professional evaluation, recruitment assessment, academic review, and personal inspiration. Systematic extraction, automated scraping, or unauthorized redistribution for commercial resale is strictly prohibited.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      3. Disclaimer of Warranty
                    </h4>
                    <p>
                      Interactive demonstrations, research papers, and software prototypes are provided &quot;as is&quot; without warranties of any kind. While every effort is made to maintain seamless performance, uninterrupted availability cannot be guaranteed.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sans font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      4. Contact & Permissions
                    </h4>
                    <p>
                      To request permission for project collaboration, research citations, or software licensing, please contact <a href="mailto:contact@liemaxels.com" className="text-amber-800 dark:text-[#FFD88A] hover:underline font-medium">contact@liemaxels.com</a>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Bar */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-black/[0.02] dark:bg-white/[0.02] text-xs text-stone-500 dark:text-stone-400 shrink-0">
              <span className="font-serif italic">Tantalize © 2026</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-medium hover:opacity-90 transition-opacity cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
});

export default LegalModal;
