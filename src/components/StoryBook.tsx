import { memo, useRef, useEffect } from 'react';
import Footer from './common/Footer';

interface StoryBookProps {
  isActive?: boolean;
  onReachTop?: () => void;
}

export const StoryBook = memo(function StoryBook({
  isActive = true,
  onReachTop,
}: StoryBookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtTopRef = useRef<boolean>(true);
  const arrivedAtTopTimeRef = useRef<number>(Date.now());
  const lastHandoffTimeRef = useRef<number>(0);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop <= 2) {
      if (!isAtTopRef.current) {
        isAtTopRef.current = true;
        arrivedAtTopTimeRef.current = Date.now();
      }
    } else {
      isAtTopRef.current = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // When at the very top of the page, scrolling up glides back to Archive Hub
    if (container.scrollTop <= 2 && e.deltaY < -25) {
      const now = Date.now();
      if (now - arrivedAtTopTimeRef.current < 400) return;
      if (now - lastHandoffTimeRef.current > 1000) {
        lastHandoffTimeRef.current = now;
        onReachTop?.();
      }
    }
  };

  // Keyboard escape shortcut to return to Archive
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'Escape') {
        onReachTop?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onReachTop]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`relative w-full h-full overflow-y-auto overflow-x-hidden select-text scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* ================= 1. EMPTY HERO CANVAS VIEWPORT (Full Screen) ================= */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-16 pointer-events-none select-none" />

      {/* ================= 2. GLOBAL SYSTEM FOOTER (Visible on scroll down) ================= */}
      <Footer />
    </div>
  );
});

export default StoryBook;
