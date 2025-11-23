import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ObjectExplorerProps {
  data: any;
  name?: string;
  depth?: number;
  theme?: 'chrome' | 'reqable';
}

// Helper to generate Chrome-like preview string: {a: 1, b: "test"}
const generatePreview = (data: any, isArray: boolean): React.ReactElement => {
  if (isArray) {
     const len = data.length;
     if (len === 0) return <span className="text-[#808080]">[]</span>;
     // Show first few items
     const previewItems = data.slice(0, 5).map((item: any) => {
        if (typeof item === 'object' && item !== null) return Array.isArray(item) ? 'Array' : '{...}';
        if (typeof item === 'string') return `"${item}"`;
        return String(item);
     });
     if (len > 5) previewItems.push('...');
     return (
        <span>
           <span className="text-[#808080] mr-1">({len})</span>
           <span className="text-[#e8eaed]">[</span>
           {previewItems.map((item: string, i: number) => (
              <span key={i}>
                 <span className="text-[#e8eaed]">{item}</span>
                 {i < previewItems.length - 1 && <span className="text-[#e8eaed] mr-1">,</span>}
              </span>
           ))}
           <span className="text-[#e8eaed]">]</span>
        </span>
     );
  } else {
     const keys = Object.keys(data);
     if (keys.length === 0) return <span className="text-[#808080]">{"{}"}</span>;
     
     return (
        <span>
           <span className="text-[#e8eaed]">{'{'}</span>
           {keys.slice(0, 3).map((key, i) => {
               const val = data[key];
               let valStr = String(val);
               if (typeof val === 'object' && val !== null) valStr = Array.isArray(val) ? 'Array' : '{...}';
               if (typeof val === 'string') valStr = `"${val}"`;
               
               return (
                  <span key={key}>
                     <span className="text-[#9cdcfe] opacity-70">{key}</span>
                     <span className="text-[#e8eaed] mr-1">:</span>
                     <span className="text-[#e8eaed]">{valStr}</span>
                     {i < keys.slice(0, 3).length && <span className="text-[#e8eaed] mr-1">,</span>}
                  </span>
               );
           })}
           {keys.length > 3 && <span className="text-[#e8eaed] mr-1">...</span>}
           <span className="text-[#e8eaed]">{'}'}</span>
        </span>
     );
  }
};

export const ObjectExplorer: React.FC<ObjectExplorerProps> = ({ data, name, depth = 0, theme = 'chrome' }) => {
  const [expanded, setExpanded] = useState(depth < 0); // Chrome defaults to collapsed unless explicitly expanded

  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  
  // --- STYLES (Precise Chrome Dark Mode Colors) ---
  const styles = {
    chrome: {
      key: "text-[#e8eaed] opacity-90", // Light gray for keys
      string: "text-[#f28b54]", // Orange for strings
      number: "text-[#9980ff]", // Purple/Blue for numbers
      boolean: "text-[#9980ff]", // Purple/Blue for booleans
      null: "text-[#7f7f7f]", // Gray for null/undefined
      arrow: "text-[#9ca0a4] opacity-70",
      bracket: "text-[#e8eaed]",
      previewKey: "text-[#9cdcfe]",
    },
    reqable: {
      key: "text-[#facc15] font-bold",
      string: "text-[#a5d6ff]",
      number: "text-[#4ade80]",
      boolean: "text-[#f472b6]",
      null: "text-gray-500",
      arrow: "text-gray-500",
      bracket: "text-white font-bold",
      previewKey: "text-gray-400"
    }
  }[theme];

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // --- RENDER PRIMITIVES ---
  if (!isObject) {
    let valueDisplay = String(data);
    let valueClass = styles.string;
    
    if (typeof data === 'number') valueClass = styles.number;
    if (typeof data === 'boolean') valueClass = styles.boolean;
    if (data === null || data === undefined) {
        valueClass = styles.null;
        valueDisplay = String(data);
    }
    if (typeof data === 'string') valueDisplay = `"${data}"`;

    return (
      <div className="font-mono text-[11px] leading-5 flex whitespace-nowrap">
        {name && <span className={`${theme === 'chrome' ? 'text-[#9cdcfe]' : styles.key} mr-1`}>{name}:</span>}
        <span className={valueClass}>{valueDisplay}</span>
      </div>
    );
  }

  // --- RENDER OBJECTS / ARRAYS ---
  const keys = Object.keys(data);
  // Chrome shows internal [[Prototype]] at the end, we simulate it visually
  const showProto = expanded && theme === 'chrome';

  return (
    <div className="font-mono text-[11px] leading-5">
      {/* Header Row */}
      <div 
        onClick={toggle}
        className="flex items-start cursor-pointer group select-text"
      >
        {/* Arrow */}
        <span className={`mr-1 transform transition-transform mt-[2px] ${expanded ? 'rotate-90' : ''} ${styles.arrow} select-none shrink-0`}>
           <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M3 2 L8 5 L3 8 Z" /></svg>
        </span>
        
        <div className="break-all">
            {name && <span className={`${theme === 'chrome' ? 'text-[#9cdcfe]' : styles.key} mr-1`}>{name}:</span>}
            
            {!expanded ? (
               // Collapsed Preview
               <span className="whitespace-nowrap">
                 {generatePreview(data, isArray)}
               </span>
            ) : (
               // Expanded Bracket Start
               <span className={styles.bracket}>{isArray ? `Array(${data.length})` : ''}</span>
            )}
        </div>
      </div>

      {/* Children Rows */}
      {expanded && (
        <div className="pl-3 ml-1">
          {keys.map((key) => (
            <ObjectExplorer 
              key={key} 
              name={key}
              data={data[key]} 
              depth={depth + 1} 
              theme={theme}
            />
          ))}
          
          {/* Simulated Prototype */}
          {showProto && (
             <div className="flex items-center opacity-50 select-none">
                 <span className={`mr-1 ${styles.arrow} mt-[2px]`}>
                     <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M3 2 L8 5 L3 8 Z" /></svg>
                 </span>
                 <span className="text-[#9cdcfe] mr-1">[[Prototype]]:</span>
                 <span className="text-[#e8eaed]">Object</span>
             </div>
          )}
        </div>
      )}
    </div>
  );
};