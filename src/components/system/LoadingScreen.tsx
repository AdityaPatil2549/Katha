import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ReactNode } from 'react';

export function LoadingScreen({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div 
        className="w-full max-w-md surface-elevated p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <div className="heading-3 text-gradient-violet text-center">{title}</div>
          {subtitle ? <div className="mt-2 text-small text-secondary text-center">{subtitle}</div> : null}
        </div>
      </motion.div>
    </div>
  );
}
