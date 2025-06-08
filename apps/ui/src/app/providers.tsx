'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTreeStore } from '@/stores/treeStore';

interface ProvidersProps {
  children: ReactNode;
}

// Create contexts for global state
const AuthContext = createContext<any>(null);
const TreeContext = createContext<any>(null);

export function Providers({ children }: ProvidersProps) {
  // You can add any global providers here
  // For now, Zustand stores are already global
  
  return (
    <div>
      {children}
    </div>
  );
} 