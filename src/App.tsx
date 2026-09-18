import { useState } from 'react';
import { motion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>('home');

  // Map each tab to 2D camera coordinates
  const getCameraCoordinates = () => {
    switch (activeTab) {
      case 'timeline':
        return { x: '-100vw', y: '0vh' };
      case 'certificate':
        return { x: '100vw', y: '0vh' };
      case 'projects':
        return { x: '0vw', y: '-100vh' };
      case 'home':
      default:
        return { x: '0vw', y: '0vh' };
    }
  };

  const coords = getCameraCoordinates();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5] select-none">
      {/* Floating Centered Apple Frosted Glass Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2D Spatial Canvas World with Kinetic Motion Blur */}
      <motion.div
        animate={{
          x: coords.x,
          y: coords.y,
          filter: [
            'blur(0px)',
            'blur(3.5px)',
            'blur(0px)',
          ],
        }}
        transition={{
          x: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
          filter: {
            duration: 1.6,
            times: [0, 0.35, 1],
            ease: 'easeInOut',
          },
        }}
        className="absolute inset-0 w-full h-full"
      >
        {/* ================= HOME SECTION (0, 0) ================= */}
        <div className="absolute left-0 top-0 w-screen h-screen overflow-hidden">
          {/* Ambient Breathing Motion */}
          <motion.div
            className="w-full h-full"
            initial={{ scale: 1.02 }}
            animate={{
              scale: [1.02, 1.05, 1.02],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          >
            <img
              src="/home.png"
              alt="Tantalize Home Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>

        {/* ================= TIMELINE SECTION (+100vw, 0) ================= */}
        <div className="absolute left-[100vw] top-0 w-screen h-screen overflow-hidden">
          {/* Ambient Breathing Motion */}
          <motion.div
            className="w-full h-full"
            initial={{ scale: 1.02 }}
            animate={{
              scale: [1.02, 1.05, 1.02],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          >
            <img
              src="/timeline.png"
              alt="Tantalize Timeline Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
