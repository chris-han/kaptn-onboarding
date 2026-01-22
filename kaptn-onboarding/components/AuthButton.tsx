'use client';

import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface AuthButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  redirectTo?: string;
}

export default function AuthButton({
  className = '',
  variant = 'primary',
  redirectTo
}: AuthButtonProps) {
  const { authenticated, user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className={`${className} opacity-50 cursor-not-allowed`}>
        <span className="text-white/60 font-mono text-sm">LOADING...</span>
      </div>
    );
  }

  const baseStyles = 'font-mono text-sm transition-all duration-300';
  const variants = {
    primary: 'bg-bridge-gold text-black hover:bg-bridge-gold/80 px-6 py-3',
    secondary: 'border-2 border-bridge-gold text-bridge-gold hover:bg-bridge-gold/10 px-6 py-3',
    ghost: 'text-white/80 hover:text-white underline',
  };

  if (authenticated && user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={signOut}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        SIGN OUT ({user.name || user.email || 'USER'})
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => signIn(redirectTo)}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      SIGN IN
    </motion.button>
  );
}
