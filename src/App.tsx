import { useState } from 'react';
import { motion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>('home');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5] select-none">
      {/* Dynamic Floating Glass Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Full Hero Background with subtle ambient breathing motion */}
      <main className="relative w-full h-full">
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
    </div>
  );
}
