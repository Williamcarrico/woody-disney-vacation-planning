'use client';

import React, { Profiler, ProfilerOnRenderCallback, useCallback, useEffect, useRef } from 'react';
import { deferOperation } from './optimization-utils';

interface PerformanceData {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  avgRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  totalRenderTime: number;
  slowRenders: number; // renders > 16ms
  phases: {
    mount: number;
    update: number;
  };
}

class PerformanceMonitorService {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private renderData: Map<string, PerformanceData[]> = new Map();
  private slowRenderThreshold = 16; // 1 frame at 60fps
  private warningThreshold = 50; // 3 frames
  private criticalThreshold = 100; // 6 frames

  recordRender(data: PerformanceData): void {
    const { id, actualDuration, phase } = data;
    
    // Store raw render data
    if (!this.renderData.has(id)) {
      this.renderData.set(id, []);
    }
    this.renderData.get(id)!.push(data);

    // Update metrics
    if (!this.metrics.has(id)) {
      this.metrics.set(id, {
        componentName: id,
        renderCount: 0,
        avgRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: Infinity,
        totalRenderTime: 0,
        slowRenders: 0,
        phases: { mount: 0, update: 0 },
      });
    }

    const metrics = this.metrics.get(id)!;
    metrics.renderCount++;
    metrics.totalRenderTime += actualDuration;
    metrics.avgRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, actualDuration);
    metrics.minRenderTime = Math.min(metrics.minRenderTime, actualDuration);
    metrics.phases[phase]++;

    if (actualDuration > this.slowRenderThreshold) {
      metrics.slowRenders++;
    }

    // Log warnings for slow renders
    if (actualDuration > this.criticalThreshold) {
      console.error(`🚨 Critical render performance: ${id} took ${actualDuration.toFixed(2)}ms`);
    } else if (actualDuration > this.warningThreshold) {
      console.warn(`⚠️ Slow render detected: ${id} took ${actualDuration.toFixed(2)}ms`);
    }
  }

  getMetrics(componentId?: string): PerformanceMetrics | PerformanceMetrics[] | null {
    if (componentId) {
      return this.metrics.get(componentId) || null;
    }
    return Array.from(this.metrics.values());
  }

  getRenderData(componentId: string): PerformanceData[] {
    return this.renderData.get(componentId) || [];
  }

  generateReport(): string {
    const report: string[] = ['=== Performance Report ===\n'];
    
    const sortedMetrics = Array.from(this.metrics.values()).sort(
      (a, b) => b.avgRenderTime - a.avgRenderTime
    );

    sortedMetrics.forEach((metric) => {
      report.push(`Component: ${metric.componentName}`);
      report.push(`  Renders: ${metric.renderCount} (${metric.phases.mount} mounts, ${metric.phases.update} updates)`);
      report.push(`  Avg Time: ${metric.avgRenderTime.toFixed(2)}ms`);
      report.push(`  Max Time: ${metric.maxRenderTime.toFixed(2)}ms`);
      report.push(`  Slow Renders: ${metric.slowRenders} (${((metric.slowRenders / metric.renderCount) * 100).toFixed(1)}%)`);
      report.push('');
    });

    return report.join('\n');
  }

  reset(): void {
    this.metrics.clear();
    this.renderData.clear();
  }

  exportData(): string {
    return JSON.stringify({
      metrics: Array.from(this.metrics.entries()),
      renderData: Array.from(this.renderData.entries()),
      timestamp: new Date().toISOString(),
    }, null, 2);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService();

// Hook for accessing performance metrics
export function usePerformanceMetrics(componentId?: string) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | PerformanceMetrics[] | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics(componentId));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000); // Update every second

    return () => clearInterval(interval);
  }, [componentId]);

  return metrics;
}

// Performance monitoring component wrapper
interface PerformanceMonitorProps {
  id: string;
  children: React.ReactNode;
  onSlowRender?: (duration: number) => void;
  logToConsole?: boolean;
}

export function PerformanceMonitor({
  id,
  children,
  onSlowRender,
  logToConsole = process.env.NODE_ENV === 'development',
}: PerformanceMonitorProps) {
  const onRender: ProfilerOnRenderCallback = useCallback(
    (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
      const data: PerformanceData = {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions,
      };

      performanceMonitor.recordRender(data);

      if (actualDuration > 16 && onSlowRender) {
        onSlowRender(actualDuration);
      }

      if (logToConsole && actualDuration > 16) {
        console.log(`[Performance] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
      }
    },
    [onSlowRender, logToConsole]
  );

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

// Performance dashboard component
export function PerformanceDashboard() {
  const metrics = usePerformanceMetrics();
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      // Keyboard shortcut to toggle dashboard (Ctrl/Cmd + Shift + P)
      const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
          setIsVisible(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  if (!isVisible || !metrics || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const metricsArray = Array.isArray(metrics) ? metrics : [metrics];

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto bg-black/90 text-white p-4 rounded-lg shadow-xl z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {metricsArray.map((metric) => (
          <div key={metric.componentName} className="border-b border-gray-700 pb-2">
            <div className="font-medium">{metric.componentName}</div>
            <div className="text-sm space-y-1 mt-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Renders:</span>
                <span>{metric.renderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Time:</span>
                <span className={metric.avgRenderTime > 16 ? 'text-red-400' : 'text-green-400'}>
                  {metric.avgRenderTime.toFixed(2)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Time:</span>
                <span className={metric.maxRenderTime > 50 ? 'text-red-400' : 'text-yellow-400'}>
                  {metric.maxRenderTime.toFixed(2)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slow Renders:</span>
                <span className={metric.slowRenders > 0 ? 'text-yellow-400' : 'text-green-400'}>
                  {metric.slowRenders} ({((metric.slowRenders / metric.renderCount) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            console.log(performanceMonitor.generateReport());
          }}
          className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
        >
          Log Report
        </button>
        <button
          onClick={() => {
            const data = performanceMonitor.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-data-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
        >
          Export Data
        </button>
        <button
          onClick={() => {
            performanceMonitor.reset();
            window.location.reload();
          }}
          className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
        >
          Reset
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl/Cmd + Shift + P to toggle
      </div>
    </div>
  );
}

// HOC for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentId?: string
) {
  const displayName = componentId || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <PerformanceMonitor id={displayName}>
        <Component {...props} ref={ref} />
      </PerformanceMonitor>
    );
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return WrappedComponent;
}

// Utility to measure specific operations
export async function measureOperation<T>(
  operationName: string,
  operation: () => T | Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    if (duration > 100) {
      console.warn(`⚠️ Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Operation failed: ${operationName} (${duration.toFixed(2)}ms)`, error);
    throw error;
  }
}