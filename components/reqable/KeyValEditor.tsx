import React from 'react';
import { X } from 'lucide-react';

export interface KeyValItem {
  key: string;
  value: string;
  enabled: boolean;
}

export interface KeyValEditorProps {
  items: KeyValItem[];
  onChange: (items: KeyValItem[]) => void;
}

export const KeyValEditor: React.FC<KeyValEditorProps> = ({ items, onChange }) => {
  const handleChange = (idx: number, field: 'key' | 'value', val: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    // Auto-add new row if editing the last one
    if (idx === items.length - 1 && (newItems[idx].key || newItems[idx].value)) {
      newItems.push({ key: '', value: '', enabled: true });
    }
    onChange(newItems);
  };

  const handleToggle = (idx: number) => {
    const newItems = [...items];
    newItems[idx].enabled = !newItems[idx].enabled;
    onChange(newItems);
  };

  const handleDelete = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    if (newItems.length === 0) newItems.push({ key: '', value: '', enabled: true });
    onChange(newItems);
  };

  return (
    <div className="flex flex-col w-full text-xs font-mono">
      <div className="flex items-center h-7 bg-[#252526] border-b border-[#333] text-gray-500 px-2">
        <div className="w-8 text-center"></div>
        <div className="flex-1 px-2 border-r border-[#333]">Key</div>
        <div className="flex-1 px-2">Value</div>
        <div className="w-8"></div>
      </div>
      <div className="flex-1 overflow-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center h-7 border-b border-[#333] group hover:bg-[#2a2d2e]">
            <div className="w-8 flex items-center justify-center">
              {idx < items.length - 1 && (
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => handleToggle(idx)}
                  className="accent-[#fcd34d]"
                />
              )}
            </div>
            <div className="flex-1 h-full border-r border-[#333]">
              <input
                value={item.key}
                onChange={(e) => handleChange(idx, 'key', e.target.value)}
                className="w-full h-full bg-transparent px-2 outline-none text-[#9cdcfe] placeholder-gray-600"
                placeholder="Key"
              />
            </div>
            <div className="flex-1 h-full">
              <input
                value={item.value}
                onChange={(e) => handleChange(idx, 'value', e.target.value)}
                className="w-full h-full bg-transparent px-2 outline-none text-[#ce9178] placeholder-gray-600"
                placeholder="Value"
              />
            </div>
            <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100">
              {idx < items.length - 1 && (
                <button onClick={() => handleDelete(idx)} className="text-gray-500 hover:text-[#f48771]">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
