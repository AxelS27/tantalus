// Shared spring for controls whose content changes their intrinsic width.
export const elasticLayoutSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 25,
};
