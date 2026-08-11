import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface BlurRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  blurAmount?: string;
}

export function BlurReveal({
  children,
  delay = 0,
  duration = 0.8,
  blurAmount = '10px',
  className = '',
  ...props
}: BlurRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: `blur(${blurAmount})`, y: 10 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
