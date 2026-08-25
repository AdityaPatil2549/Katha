'use client';
import { cn } from '@/lib/utils';
import { motion, Transition } from 'framer-motion';

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?:
    | 'rotate'
    | 'pulse'
    | 'breathe'
    | 'colorShift'
    | 'flowHorizontal'
    | 'static';
  blur?:
    | number
    | 'softest'
    | 'soft'
    | 'medium'
    | 'strong'
    | 'stronger'
    | 'strongest'
    | 'none';
  transition?: Transition;
  scale?: number;
  duration?: number;
};

export function GlowEffect({
  className,
  style,
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'rotate',
  blur = 'medium',
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: duration,
    ease: 'linear' as const,
  };

  const animations = {
    rotate: {
      rotate: [0, 360],
      transition: {
        ...(transition ?? BASE_TRANSITION),
      },
    },
    pulse: {
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    breathe: {
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      opacity: [0.7, 1, 0.7],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    colorShift: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    flowHorizontal: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    static: {},
  };

  const getStaticBackground = () => {
    switch (mode) {
      case 'rotate':
        return `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`;
      case 'pulse':
      case 'breathe':
        return `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, transparent 100%)`;
      case 'colorShift':
      case 'flowHorizontal':
      case 'static':
        return `linear-gradient(to right, ${colors.join(', ')})`;
      default:
        return undefined;
    }
  };

  const getBlurClass = (blur: GlowEffectProps['blur']) => {
    if (typeof blur === 'number') {
      return `blur-[${blur}px]`;
    }

    const presets = {
      softest: 'blur-xs',
      soft: 'blur-sm',
      medium: 'blur-md',
      strong: 'blur-lg',
      stronger: 'blur-xl',
      strongest: 'blur-xl',
      none: 'blur-none',
    };

    return presets[blur as keyof typeof presets];
  };

  return (
    <motion.div
      style={
        {
          ...style,
          '--scale': scale,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          background: getStaticBackground(),
          backgroundSize: (mode === 'colorShift' || mode === 'flowHorizontal') ? '200% 200%' : undefined,
        } as React.CSSProperties
      }
      animate={animations[mode]}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        'scale-[var(--scale)] transform-gpu',
        getBlurClass(blur),
        className
      )}
    />
  );
}
