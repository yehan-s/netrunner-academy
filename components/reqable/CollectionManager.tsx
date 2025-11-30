import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderTree, FileText, Plus, Trash2, Edit2, ChevronRight, ChevronDown,
  Download, Upload, MoreHorizontal, X, Check, Copy, Play
} from 'lucide-react';
import { NetworkRequest } from '../../types';

// Collection 数据结构
export interface CollectionItem {
  id: string;
  type: 'folder' | 'request';
  name: string;
  parentId: string | null;
  // 仅 request 类型有效
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  // 元数据
  createdAt: number;
  updatedAt: number;
}

// 从 localStorage 加载
const loadCollections = (): CollectionItem[] => {
  try {
    const saved = localStorage.getItem('reqable_collections');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    { id: 'root', type: 'folder', name: 'My Collection', parentId: null, createdAt: Date.now(), updatedAt: Date.now() }
  ];
};

// 保存到 localStorage
const saveCollections = (items: CollectionItem[]) => {
  localStorage.setItem('reqable_collections', JSON.stringify(items));
};

// 导出为 Postman 格式
const exportToPostman = (items: CollectionItem[]): string => {
  const buildItem = (item: CollectionItem, allItems: CollectionItem[]): any => {
    if (item.type === 'folder') {
      const children = allItems.filter(i => i.parentId === item.id);
      return {
        name: item.name,
        item: children.map(c => buildItem(c, allItems))
      };
    } else {
      return {
        name: item.name,
        request: {
          method: item.method || 'GET',
          header: Object.entries(item.headers || {}).map(([key, value]) => ({ key, value })),
          url: { raw: item.url || '' },
          body: item.body ? { mode: 'raw', raw: item.body } : undefined
        }
      };
    }
  };

  const rootFolders = items.filter(i => i.parentId === null && i.type === 'folder');
  const collection = {
    info: {
      name: 'Exported Collection',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: rootFolders.map(f => buildItem(f, items))
  };

  return JSON.stringify(collection, null, 2);
};

// 从 Postman 格式导入
const importFromPostman = (json: string): CollectionItem[] => {
  try {
    const data = JSON.parse(json);
    const items: CollectionItem[] = [];
    
    const processItem = (item: any, parentId: string | null, depth: number = 0): void => {
      if (depth > 4) return; // 限制 4 级
      
      const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (item.item && Array.isArray(item.item)) {
        // 是文件夹
        items.push({
          id,
          type: 'folder',
          name: item.name || 'Untitled Folder',
          parentId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        item.item.forEach((child: any) => processItem(child, id, depth + 1));
      } else if (item.request) {
        // 是请求
        const req = item.request;
        items.push({
          id,
          type: 'request',
          name: item.name || 'Untitled Request',
          parentId,
          method: req.method || 'GET',
          url: typeof req.url === 'string' ? req.url : req.url?.raw || '',
          headers: (req.header || []).reduce((acc: Record<string, string>, h: any) => {
            if (h.key) acc[h.key] = h.value || '';
            return acc;
          }, {}),
          body: req.body?.raw || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    };

    // 处理根级别
    if (data.item) {
      data.item.forEach((item: any) => processItem(item, null, 0));
    }

    return items;
  } catch (e) {
    console.error('Import failed:', e);
    return [];
  }
};

export interface CollectionManagerProps {
  onOpenRequest: (item: CollectionItem) => void;
  onSendRequest: (req: NetworkRequest) => void;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  onOpenRequest,
  onSendRequest
}) => {
  const [items, setItems] = useState<CollectionItem[]>(loadCollections);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 持久化
  useEffect(() => {
    saveCollections(items);
  }, [items]);
  
  // 切换文件夹展开
  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  // 获取子项
  const getChildren = (parentId: string | null): CollectionItem[] => {
    return items.filter(i => i.parentId === parentId)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  };
  
  // 获取文件夹深度
  const getFolderDepth = (id: string | null): number => {
    if (!id) return 0;
    const item = items.find(i => i.id === id);
    if (!item || !item.parentId) return 1;
    return 1 + getFolderDepth(item.parentId);
  };
  
  // 创建新文件夹
  const createFolder = (parentId: string | null) => {
    if (getFolderDepth(parentId) >= 4) {
      alert('Maximum folder depth (4 levels) reached');
      return;
    }
    
    const newFolder: CollectionItem = {
      id: `folder-${Date.now()}`,
      type: 'folder',
      name: 'New Folder',
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setItems(prev => [...prev, newFolder]);
    setEditingId(newFolder.id);
    setEditingName(newFolder.name);
    if (parentId) setExpandedFolders(prev => new Set([...Array.from(prev), parentId]));
  };
  
  // 创建新请求
  const createRequest = (parentId: string | null) => {
    const newRequest: CollectionItem = {
      id: `req-${Date.now()}`,
      type: 'request',
      name: 'New Request',
      parentId,
      method: 'GET',
      url: 'https://',
      headers: {},
      body: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setItems(prev => [...prev, newRequest]);
    setEditingId(newRequest.id);
    setEditingName(newRequest.name);
    if (parentId) setExpandedFolders(prev => new Set([...Array.from(prev), parentId]));
  };
  
  // 重命名项目
  const renameItem = (id: string, name: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, name, updatedAt: Date.now() } : i));
    setEditingId(null);
  };
  
  // 删除项目（及其子项）
  const deleteItem = (id: string) => {
    const toDelete = new Set<string>();
    const collectChildren = (parentId: string) => {
      toDelete.add(parentId);
      items.filter(i => i.parentId === parentId).forEach(i => collectChildren(i.id));
    };
    collectChildren(id);
    setItems(prev => prev.filter(i => !toDelete.has(i.id)));
  };
  
  // 复制项目
  const duplicateItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const newItem: CollectionItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setItems(prev => [...prev, newItem]);
  };
  
  // 导出
  const handleExport = () => {
    const json = exportToPostman(items);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collection.postman_collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // 导入
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const imported = importFromPostman(text);
      if (imported.length > 0) {
        // 创建导入的根文件夹
        const importFolder: CollectionItem = {
          id: `import-${Date.now()}`,
          type: 'folder',
          name: file.name.replace('.json', ''),
          parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        // 更新导入项的 parentId
        const updatedImported = imported.map(i => 
          i.parentId === null ? { ...i, parentId: importFolder.id } : i
        );
        setItems(prev => [...prev, importFolder, ...updatedImported]);
        setExpandedFolders(prev => new Set([...Array.from(prev), importFolder.id]));
      }
    } catch (err) {
      alert('Failed to import collection');
    }
    e.target.value = '';
  };
  
  // 发送请求
  const sendRequest = (item: CollectionItem) => {
    if (item.type !== 'request') return;
    
    const req: NetworkRequest = {
      id: `col-${Date.now()}`,
      url: item.url || '',
      method: item.method || 'GET',
      status: 0,
      type: 'fetch',
      size: 0,
      time: 0,
      timestamp: Date.now(),
      requestHeaders: item.headers || {},
      responseHeaders: {},
      requestBody: item.body
    };
    onSendRequest(req);
  };
  
  // 渲染树节点
  const renderItem = (item: CollectionItem, depth: number = 0): React.ReactNode => {
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(item.id);
    const isEditing = editingId === item.id;
    const children = getChildren(item.id);
    
    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-1 py-1.5 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px] group`}
          style={{ paddingLeft: depth * 12 + 8 }}
          onClick={() => {
            if (isFolder) toggleFolder(item.id);
            else onOpenRequest(item);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id });
          }}
        >
          {isFolder ? (
            isExpanded ? <ChevronDown size={12} className="text-gray-500 shrink-0" /> : <ChevronRight size={12} className="text-gray-500 shrink-0" />
          ) : (
            <span className="w-3" />
          )}
          
          {isFolder ? (
            <FolderTree size={12} className="text-[#dcb67a] shrink-0" />
          ) : (
            <span className={`text-[10px] font-bold w-8 shrink-0 ${
              item.method === 'GET' ? 'text-[#4ec9b0]' : 
              item.method === 'POST' ? 'text-[#ce9178]' : 
              item.method === 'PUT' ? 'text-[#569cd6]' : 
              item.method === 'DELETE' ? 'text-[#f48771]' : 'text-gray-400'
            }`}>{item.method}</span>
          )}
          
          {isEditing ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => renameItem(item.id, editingName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') renameItem(item.id, editingName);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="flex-1 bg-[#1e1e1e] border border-[#4ec9b0] text-gray-300 text-[11px] px-1 rounded outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate flex-1 text-gray-300">{item.name}</span>
          )}
          
          {/* 快捷操作按钮 */}
          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
              {!isFolder && (
                <button
                  onClick={(e) => { e.stopPropagation(); sendRequest(item); }}
                  className="p-0.5 hover:bg-[#4ec9b0]/20 rounded"
                  title="Send"
                >
                  <Play size={10} className="text-[#4ec9b0]" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setEditingName(item.name); }}
                className="p-0.5 hover:bg-[#4a4a4a] rounded"
                title="Rename"
              >
                <Edit2 size={10} className="text-gray-500" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                className="p-0.5 hover:bg-[#4a4a4a] rounded"
                title="Delete"
              >
                <Trash2 size={10} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>
        
        {/* 子项 */}
        {isFolder && isExpanded && children.map(child => renderItem(child, depth + 1))}
      </div>
    );
  };
  
  const rootItems = getChildren(null);
  
  return (
    <div className="flex flex-col h-full" onClick={() => setContextMenu(null)} data-testid="collection-manager">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-[#3c3c3c] shrink-0">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Collections</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => createFolder(null)}
            className="p-1 hover:bg-[#37373d] rounded text-gray-500 hover:text-gray-300"
            title="New Folder"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleExport}
            className="p-1 hover:bg-[#37373d] rounded text-gray-500 hover:text-gray-300"
            title="Export"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-[#37373d] rounded text-gray-500 hover:text-gray-300"
            title="Import"
          >
            <Upload size={14} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-1">
        {rootItems.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-8">
            <FolderTree size={32} className="mx-auto mb-2 opacity-20" />
            <div>No collections yet</div>
            <button
              onClick={() => createFolder(null)}
              className="mt-2 text-[#4ec9b0] hover:underline"
            >
              Create your first collection
            </button>
          </div>
        ) : (
          rootItems.map(item => renderItem(item, 0))
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#252526] border border-[#454545] rounded shadow-xl z-50 py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {items.find(i => i.id === contextMenu.itemId)?.type === 'folder' && (
            <>
              <button
                className="w-full px-3 py-1.5 text-left text-[11px] text-gray-300 hover:bg-[#37373d] flex items-center gap-2"
                onClick={() => { createFolder(contextMenu.itemId); setContextMenu(null); }}
              >
                <FolderTree size={12} /> New Folder
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-[11px] text-gray-300 hover:bg-[#37373d] flex items-center gap-2"
                onClick={() => { createRequest(contextMenu.itemId); setContextMenu(null); }}
              >
                <FileText size={12} /> New Request
              </button>
              <div className="h-px bg-[#454545] my-1" />
            </>
          )}
          <button
            className="w-full px-3 py-1.5 text-left text-[11px] text-gray-300 hover:bg-[#37373d] flex items-center gap-2"
            onClick={() => { 
              const item = items.find(i => i.id === contextMenu.itemId);
              if (item) { setEditingId(item.id); setEditingName(item.name); }
              setContextMenu(null); 
            }}
          >
            <Edit2 size={12} /> Rename
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-[11px] text-gray-300 hover:bg-[#37373d] flex items-center gap-2"
            onClick={() => { duplicateItem(contextMenu.itemId); setContextMenu(null); }}
          >
            <Copy size={12} /> Duplicate
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-[11px] text-[#f48771] hover:bg-[#37373d] flex items-center gap-2"
            onClick={() => { deleteItem(contextMenu.itemId); setContextMenu(null); }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// 保存请求到集合的对话框
export interface SaveToCollectionDialogProps {
  request: NetworkRequest;
  onClose: () => void;
  onSaved: () => void;
}

export const SaveToCollectionDialog: React.FC<SaveToCollectionDialogProps> = ({
  request,
  onClose,
  onSaved
}) => {
  const [items, setItems] = useState<CollectionItem[]>(loadCollections);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('root');
  const [name, setName] = useState(() => {
    try {
      return new URL(request.url).pathname || 'New Request';
    } catch {
      return 'New Request';
    }
  });
  
  const folders = items.filter(i => i.type === 'folder');
  
  const handleSave = () => {
    const newRequest: CollectionItem = {
      id: `req-${Date.now()}`,
      type: 'request',
      name,
      parentId: selectedFolderId,
      method: request.method,
      url: request.url,
      headers: request.requestHeaders,
      body: request.requestBody,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const updated = [...items, newRequest];
    saveCollections(updated);
    onSaved();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#252526] border border-[#454545] rounded-lg w-[400px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="h-10 flex items-center justify-between px-4 border-b border-[#454545]">
          <span className="text-sm font-medium text-gray-200">Save to Collection</span>
          <button onClick={onClose} className="p-1 hover:bg-[#37373d] rounded">
            <X size={14} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-8 bg-[#1e1e1e] border border-[#454545] text-gray-300 text-xs px-2 rounded outline-none focus:border-[#4ec9b0]"
              data-testid="collection-item-name"
            />
          </div>
          
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Save to</label>
            <select
              value={selectedFolderId || ''}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              className="w-full h-8 bg-[#1e1e1e] border border-[#454545] text-gray-300 text-xs px-2 rounded outline-none focus:border-[#4ec9b0]"
              data-testid="collection-folder-select"
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          
          <div className="p-3 bg-[#1e1e1e] rounded border border-[#454545]">
            <div className="flex items-center gap-2 text-xs">
              <span className={`font-bold ${
                request.method === 'GET' ? 'text-[#4ec9b0]' : 
                request.method === 'POST' ? 'text-[#ce9178]' : 'text-gray-400'
              }`}>{request.method}</span>
              <span className="text-gray-400 truncate">{request.url}</span>
            </div>
          </div>
        </div>
        
        <div className="h-12 flex items-center justify-end gap-2 px-4 border-t border-[#454545]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#4ec9b0] text-black text-xs font-medium rounded hover:bg-[#3db89f]"
            data-testid="save-confirm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
