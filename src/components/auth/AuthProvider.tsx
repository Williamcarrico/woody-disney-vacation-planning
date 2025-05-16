"use client";

import { AuthProvider as OriginalAuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

export function AuthProviderWrapper({ children }: { readonly children: ReactNode }) {
    return <OriginalAuthProvider>{children}</OriginalAuthProvider>;
}