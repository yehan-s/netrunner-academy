import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ size?: number }>;
  shortcut?: string;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  actions: ContextMenuAction[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, actions }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  // 简单直接的边界检测 - 菜单宽度约 200px，高度约 160px
  const menuWidth = 200;
  const menuHeight = 160;
  const padding = 10;

  let finalX = x;
  let finalY = y;

  // 防止超出右边界
  if (x + menuWidth > window.innerWidth) {
    finalX = window.innerWidth - menuWidth - padding;
  }
  // 防止超出下边界
  if (y + menuHeight > window.innerHeight) {
    finalY = window.innerHeight - menuHeight - padding;
  }
  // 防止负值
  if (finalX < padding) finalX = padding;
  if (finalY < padding) finalY = padding;

  // 使用 Portal 渲染到 body，避免父元素 transform 影响 fixed 定位
  const menuContent = (
    <div
      className="fixed z-[9999] bg-[#252526] border border-[#454545] shadow-xl rounded py-1 min-w-[200px]"
      style={{ top: finalY, left: finalX }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => { action.onClick(); onClose(); }}
          className="w-full text-left px-3 py-1.5 text-[12px] text-gray-300 hover:bg-[#094771] hover:text-white flex items-center gap-2"
        >
          {action.icon && <action.icon size={14} />}
          <span className="flex-1">{action.label}</span>
          {action.shortcut && <span className="text-gray-500 text-[10px]">{action.shortcut}</span>}
        </button>
      ))}
    </div>
  );

  // 确保在浏览器环境中使用 Portal
  if (typeof document === 'undefined') return null;
  return createPortal(menuContent, document.body);
};
