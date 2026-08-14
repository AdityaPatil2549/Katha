import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoggingIn(false);
    }
  };

    <div className="w-full min-h-screen bg-[#04050C] flex items-center justify-center relative overflow-hidden">
      
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-cyan-900/10 to-[#04050C]" />
        {/* Deep cinematic glowing orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] mix-blend-screen"
        />
        
        {/* Background Image with intense overlay so it's subtle */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=3425&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-[0.15]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-28 h-28 relative flex items-center justify-center mb-8 mx-auto"
          >
            {/* Glowing 3D Orb Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full blur-2xl opacity-40 animate-pulse mix-blend-screen" />
            <div className="absolute inset-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-2xl shadow-[inset_0_0_30px_rgba(255,255,255,0.2)]" />
            
            <img src="/icons/logo-dark.png" alt="Katha" className="w-12 h-12 object-contain logo-dark drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10" />
            <img src="/icons/logo-light.png" alt="Katha" className="w-12 h-12 object-contain logo-light drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] relative z-10" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Katha
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-violet-400/80 font-semibold mb-8">
            Powered by Smriti
          </p>
          
          <p className="text-white/70 font-light text-base leading-relaxed mb-10">
            Sign in to synchronize your cinematic universe across all your devices.
          </p>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full relative group h-14 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                <span className="relative z-10">Sign in with Google</span>
              </>
            )}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 mix-blend-overlay" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
