import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { getAssetUrl } from '../lib/assets';
import type { PortfolioSettings } from '../lib/settings';
import './ThemeEntrance.css';

type Theme = PortfolioSettings['theme'];

interface ThemeEntranceProps {
  onChoose: (theme: Theme) => void;
  onComplete: () => void;
  reducedMotion: boolean;
}

const choices = [
  { theme: 'light', title: 'Light', Icon: Sun },
  { theme: 'dark', title: 'Dark', Icon: Moon },
] as const;

export default function ThemeEntrance({ onChoose, onComplete, reducedMotion }: ThemeEntranceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const quoteRef = useRef<HTMLElement>(null);
  const quoteTimerRef = useRef<number | null>(null);
  const selectionRef = useRef<Theme | null>(null);
  const [preview, setPreview] = useState<Theme | null>(null);
  const [selection, setSelection] = useState<Theme | null>(null);
  const [choicesReady, setChoicesReady] = useState(reducedMotion);
  const isPresent = useIsPresent();

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    return () => {
      if (quoteTimerRef.current !== null) window.clearTimeout(quoteTimerRef.current);
    };
  }, []);

  const choose = (theme: Theme) => {
    if (!choicesReady || selectionRef.current || !isPresent) return;
    selectionRef.current = theme;
    setSelection(theme);
    onChoose(theme);
  };

  const holdQuote = () => {
    if (quoteTimerRef.current !== null || !isPresent) return;
    quoteRef.current?.focus({ preventScroll: true });
    // Start the reading pause only after the last letter is visible.
    quoteTimerRef.current = window.setTimeout(onComplete, 3200);
  };

  const renderLetters = (text: string, start: number, interval = 0.08, onFinished?: () => void) => {
    let letterIndex = 0;
    const words = text.split(' ');
    return words.map((word, wordIndex) => (
      <span className="theme-entrance-word" key={wordIndex}>
        {[...word].map((letter, index) => (
          <span
            className="theme-entrance-letter"
            key={index}
            style={{ '--letter-delay': `${start + letterIndex++ * interval}s` } as CSSProperties}
            onAnimationEnd={onFinished && wordIndex === words.length - 1 && index === [...word].length - 1
              ? onFinished : undefined}
          >
            {letter}
          </span>
        ))}
      </span>
    ));
  };

  return (
    <motion.main
      className="theme-entrance"
      aria-label="Galleria of Tantalus"
      data-preview={selection ?? preview ?? 'neutral'}
      data-reduced-motion={reducedMotion}
      data-exiting={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.15 : 2, ease: [0.45, 0, 0.55, 1] } }}
      transition={{ duration: reducedMotion ? 0.15 : 0.9, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="theme-entrance-backdrop" aria-hidden="true">
        <img
          className="theme-entrance-artwork"
          src={getAssetUrl('/images/tantalize/home.webp')}
          srcSet={`${getAssetUrl('/images/tantalize/home-960.webp')} 960w, ${getAssetUrl('/images/tantalize/home-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/home.webp')} 1672w`}
          sizes="106vw"
          alt=""
          decoding="async"
          onError={event => {
            const image = event.currentTarget;
            if (image.src === new URL('/images/tantalize/home.webp', window.location.href).href) return;
            image.srcset = '';
            image.src = '/images/tantalize/home.webp';
          }}
        />
        <div className="theme-entrance-wash" />
      </div>

      <AnimatePresence mode="wait">
        {selection === null ? (
          <motion.div
            key="theme-choice"
            className="theme-entrance-content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: 'easeOut' }}
          >
            <h1 id="theme-entrance-title" ref={headingRef} tabIndex={-1} aria-label="Welcome to the Galleria of Tantalus">
              <span className="theme-entrance-welcome" aria-hidden="true">{renderLetters('Welcome to the', 0.35)}</span>
              <span className="theme-entrance-title-line" aria-hidden="true">{renderLetters('Galleria of Tantalus', 1.65)}</span>
            </h1>
            <motion.div
              className="theme-entrance-options"
              aria-label="Choose your theme"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.15 : 1.1, delay: reducedMotion ? 0 : 3.65, ease: [0.45, 0, 0.55, 1] }}
              onAnimationComplete={() => setChoicesReady(true)}
            >
              {choices.map(({ theme, title, Icon }) => (
                <button
                  key={theme}
                  type="button"
                  className="theme-entrance-choice"
                  aria-label={`Choose ${theme} theme`}
                  data-active={preview === theme}
                  disabled={!choicesReady || selection !== null || !isPresent}
                  onPointerEnter={event => { if (event.pointerType !== 'touch') setPreview(theme); }}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={() => setPreview(theme)}
                  onBlur={() => setPreview(null)}
                  onClick={() => choose(theme)}
                >
                  <Icon className="theme-entrance-symbol" aria-hidden="true" strokeWidth={1} />
                  <span className="theme-entrance-name">{title}</span>
                  <span className="theme-entrance-label">theme</span>
                </button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.figure
            key="entrance-quote"
            ref={quoteRef}
            tabIndex={-1}
            className="theme-entrance-quote"
            aria-labelledby="theme-entrance-quote-caption theme-entrance-quote-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPresent ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0.15 : isPresent ? 0.6 : 0.7, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={reducedMotion ? holdQuote : undefined}
          >
            <figcaption id="theme-entrance-quote-caption" aria-label="As the ancients once said,">
              <span aria-hidden="true">{renderLetters('As the ancients once said,', 0.35, 0.095)}</span>
            </figcaption>
            <blockquote id="theme-entrance-quote-text" aria-label="So close, yet so far.">
              <span aria-hidden="true">{renderLetters('“So close, yet so far.”', 3.2, 0.11, holdQuote)}</span>
            </blockquote>
          </motion.figure>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
