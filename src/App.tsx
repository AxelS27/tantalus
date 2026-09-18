import { useState } from 'react';
import { motion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>('home');

  // Map each tab to 2D camera coordinates (Center, East, South, West)
  const getCameraCoordinates = () => {
    switch (activeTab) {
      case 'timeline':
        return { x: '-100vw', y: '0vh' };
      case 'projects':
        return { x: '0vw', y: '-100vh' };
      case 'certificate':
        return { x: '100vw', y: '0vh' };
      case 'home':
      default:
        return { x: '0vw', y: '0vh' };
    }
  };

  const coords = getCameraCoordinates();

  // Reusable mask style for seamless atmospheric edge feathering
  const seamlessMaskStyle = {
    maskImage: 'radial-gradient(ellipse 96% 92% at 50% 50%, black 60%, rgba(0,0,0,0.85) 80%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse 96% 92% at 50% 50%, black 60%, rgba(0,0,0,0.85) 80%, transparent 100%)',
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5] select-none">
      {/* Floating Centered Apple Frosted Glass Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2D Spatial Canvas World */}
      <motion.div
        initial={{ x: '0vw', y: '0vh' }}
        animate={{
          x: coords.x,
          y: coords.y,
        }}
        transition={{
          duration: 1.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 w-full h-full"
      >
        {/* ================= 1. HOME SECTION (Center: 0, 0) ================= */}
        <div className="absolute left-0 top-0 w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
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
              alt="Home Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>

          {/* Upper-Left Editorial Identity */}
          <div className="absolute top-[25%] sm:top-[27%] left-6 sm:left-14 md:left-20 z-20 pointer-events-none select-none space-y-2 sm:space-y-2.5 max-w-5xl">
            {/* Line 1: Name */}
            <h1
              className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight font-light leading-none whitespace-nowrap"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.65)',
              }}
            >
              Farrell Axel Suwandi
            </h1>

            {/* Line 2: Role (Antique Gold) */}
            <p
              className="font-serif italic text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#E8C582] tracking-wide font-normal whitespace-nowrap"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.65)',
              }}
            >
              AI Researcher & Software Engineer
            </p>

            {/* Line 3: Age & Location */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 font-serif italic text-sm sm:text-base md:text-lg lg:text-xl text-stone-100/90 tracking-wide font-light whitespace-nowrap"
              style={{
                textShadow: '0 1px 8px rgba(0,0,0,0.85), 0 3px 14px rgba(0,0,0,0.6)',
              }}
            >
              <span>20 years old</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C582] shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
              <span>Jakarta</span>
            </div>

            {/* Line 4: Passions */}
            <p
              className="font-serif italic text-sm sm:text-base md:text-lg lg:text-xl text-stone-100/85 tracking-wide font-light whitespace-nowrap pt-0.5"
              style={{
                textShadow: '0 1px 8px rgba(0,0,0,0.85), 0 3px 14px rgba(0,0,0,0.6)',
              }}
            >
              love to playing piano, coding, and watching movies
            </p>
          </div>
        </div>

        {/* ================= 2. TIMELINE SECTION (East: +100vw, 0) ================= */}
        <div className="absolute left-[100vw] top-0 w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
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
              alt="Timeline Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>

        {/* ================= 3. PROJECTS SECTION (South: 0, +100vh) ================= */}
        <div className="absolute left-0 top-[100vh] w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
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
              src="/projects.png"
              alt="Projects Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>

        {/* ================= 4. CERTIFICATES SECTION (West: -100vw, 0) ================= */}
        <div className="absolute left-[-100vw] top-0 w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
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
              src="/certificates.png"
              alt="Certificates Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>

        {/* ================= 5. STATUE SECTION (Bottom-Right: +100vw, +100vh) ================= */}
        <div className="absolute left-[100vw] top-[100vh] w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
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
              src="/statue.png"
              alt="Athena Statue Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>

        {/* ================= 6. BRIDGE SECTION (Bottom-Left: -100vw, +100vh) ================= */}
        <div className="absolute left-[-100vw] top-[100vh] w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
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
              src="/bridge.png"
              alt="Greek Bridge Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
