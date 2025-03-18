
import React from 'react';
import { motion } from 'framer-motion';

export const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      delay,
      duration: 0.5
    }
  }
});

export const slideInUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      delay,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
});

export const slideInLeft = (delay = 0) => ({
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      delay,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
});

export const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      delay,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
});

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface MotionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variants?: any;
}

export const FadeIn: React.FC<MotionProps> = ({ 
  children, 
  delay = 0, 
  className = '',
  variants = fadeIn
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={variants(delay)}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideIn: React.FC<MotionProps> = ({ 
  children, 
  delay = 0, 
  className = '',
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={slideInUp(delay)}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn: React.FC<MotionProps> = ({ 
  children, 
  delay = 0, 
  className = '',
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={scaleIn(delay)}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer: React.FC<MotionProps> = ({ 
  children, 
  className = '',
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={staggerContainer}
    className={className}
  >
    {children}
  </motion.div>
);
