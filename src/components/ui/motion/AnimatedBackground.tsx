'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, Transition, motion } from 'framer-motion';
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  useId,
} from 'react';

export type AnimatedBackgroundChildProps = {
  'data-id': string;
  'data-checked'?: string;
  className?: string | ((props: { isActive: boolean; isPending?: boolean }) => string);
  children?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  [key: string]: unknown;
};

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<AnimatedBackgroundChildProps>[]
    | ReactElement<AnimatedBackgroundChildProps>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);

    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child: ReactElement<AnimatedBackgroundChildProps>, index) => {
    const id = child.props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    const resolvedClassName = typeof child.props.className === 'function'
      ? (args: { isActive: boolean; isPending?: boolean }) => cn('relative inline-flex', (child.props.className as (props: { isActive: boolean; isPending?: boolean }) => string)(args))
      : cn('relative inline-flex', child.props.className);

    return cloneElement(
      child,
      {
        key: index,
        className: resolvedClassName,
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className='z-10'>{child.props.children}</div>
      </>
    );
  });
}
