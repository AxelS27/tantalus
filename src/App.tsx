import { motion } from 'motion/react';

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none bg-[#030303] text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="space-y-4"
      >
        <h1 className="text-4xl sm:text-6xl font-light tracking-[0.25em] text-neutral-100">
          TANTALIZE
        </h1>
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          Minimalist Canvas
        </p>
      </motion.div>
    </main>
  );
}
