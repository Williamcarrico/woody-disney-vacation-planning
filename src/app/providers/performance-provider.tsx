'use client';

import React from 'react';
import { PerformanceDashboard } from '@/lib/performance/performance-monitor';

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableDashboard?: boolean;
}

export function PerformanceProvider({ 
  children, 
  enableDashboard = process.env.NODE_ENV === 'development' 
}: PerformanceProviderProps) {
  return (
    <>
      {children}
      {enableDashboard && <PerformanceDashboard />}
    </>
  );
}