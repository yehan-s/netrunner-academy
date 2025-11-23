import { useEffect, useRef, useState } from 'react';

type DevToolsSide = 'bottom' | 'right';

export interface DevToolsConfig {
  size: number;
  side: DevToolsSide;
}

export function useDevToolsResize(initialConfig: DevToolsConfig) {
  const [config, setConfig] = useState<DevToolsConfig>(initialConfig);
  const resizingRef = useRef(false);

  const startResizing = () => {
    resizingRef.current = true;
    document.body.style.cursor =
      config.side === 'bottom' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const stopResizing = () => {
      resizingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;

      if (config.side === 'bottom') {
        const containerHeight =
          document.getElementById('browser-window')?.clientHeight ||
          window.innerHeight;
        const newHeight = window.innerHeight - e.clientY - 80;
        const clampedHeight = Math.max(
          100,
          Math.min(containerHeight - 100, newHeight),
        );
        setConfig(prev => ({ ...prev, size: clampedHeight }));
      } else {
        const container = document.getElementById('browser-window');
        const containerLeft = container?.getBoundingClientRect().left ?? 0;
        const containerWidth = container?.clientWidth ?? 1000;
        const newWidth = containerWidth - (e.clientX - containerLeft);
        const clampedWidth = Math.max(
          200,
          Math.min(containerWidth - 200, newWidth),
        );
        setConfig(prev => ({ ...prev, size: clampedWidth }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [config.side]);

  return {
    devToolsConfig: config,
    setDevToolsConfig: setConfig,
    startResizing,
  };
}

