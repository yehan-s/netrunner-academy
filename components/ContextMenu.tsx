import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  actions: ContextMenuAction[];
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, actions, className }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: y, left: x });

  useEffect(() => {
    setMounted(true);
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleClick);
    document.addEventListener('scroll', handleClick, true); // Close on scroll
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
      document.removeEventListener('scroll', handleClick, true);
    };
  }, [onClose]);

  // Use useLayoutEffect to measure and adjust position before paint
  React.useLayoutEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newTop = y;
      let newLeft = x;

      // Flip vertically if it overflows bottom
      if (y + rect.height > viewportHeight) {
        newTop = y - rect.height;
      }

      // Flip horizontally if it overflows right
      if (x + rect.width > viewportWidth) {
        newLeft = x - rect.width;
      }

      // Ensure it doesn't go off-screen top/left
      newTop = Math.max(0, newTop);
      newLeft = Math.max(0, newLeft);

      setPosition({ top: newTop, left: newLeft });
    }
  }, [x, y, mounted]); // Re-run when coordinates change or mount state changes

  if (!mounted) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed z-[9999] bg-[#252526] border border-[#454545] shadow-xl rounded py-1 min-w-[200px] text-gray-300 font-sans select-none ${className}`}
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {actions.map((action, idx) => (
        action.separator ? (
          <div key={idx} className="h-[1px] bg-[#454545] my-1 mx-2" />
        ) : (
          <button
            key={idx}
            onClick={() => {
              if (!action.disabled) {
                action.onClick();
                onClose();
              }
            }}
            disabled={action.disabled}
            className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#094771] hover:text-white cursor-pointer'}
            `}
          >
            {action.icon && <action.icon size={14} className={action.disabled ? "opacity-50" : ""} />}
            <span className="flex-1">{action.label}</span>
            {action.shortcut && <span className="text-gray-500 text-[10px] ml-4">{action.shortcut}</span>}
          </button>
        )
      ))}
    </div>,
    document.body
  );
};
