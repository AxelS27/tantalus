import { motion } from 'motion/react';

export default function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5] select-none">
      {/* Full Hero Background with subtle ambient motion */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{
          scale: [1.05, 1.08, 1.05],
          opacity: 1,
        }}
        transition={{
          scale: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          },
          opacity: {
            duration: 1.2,
            ease: 'easeOut',
          },
        }}
      >
        <img
          src="/bg-hero.png"
          alt="Tantalize Hero Background"
          className="w-full h-full object-cover object-center pointer-events-none"
        />
      </motion.div>
    </main>
  );
}
