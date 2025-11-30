import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, FolderTree, Bookmark, Star, ChevronRight, ChevronDown, 
  Search, Plus, Trash2, FileText, Lock, X
} from 'lucide-react';
import { NetworkRequest } from '../../types';

// Explorer 视图类型
type ExplorerView = 'domain' | 'structure' | 'bookmark' | 'favorite';

// URL 结构树节点类型
interface TreeNode {
  _children: Record<string, TreeNode>;
  _requests: NetworkRequest[];
}

// 书签类型
interface BookmarkItem {
  id: string;
  name: string;
  urlPattern: string;
  folderId?: string;
}

interface BookmarkFolder {
  id: string;
  name: string;
}

// 收藏类型
interface FavoriteItem {
  id: string;
  requestId: string;
  name: string;
  url: string;
  method: string;
  folderId?: string;
}

interface FavoriteFolder {
  id: string;
  name: string;
}

// 从 localStorage 加载数据
const loadBookmarks = (): { folders: BookmarkFolder[]; items: BookmarkItem[] } => {
  try {
    const saved = localStorage.getItem('reqable_bookmarks');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { folders: [{ id: 'default', name: 'My Bookmarks' }], items: [] };
};

const loadFavorites = (): { folders: FavoriteFolder[]; items: FavoriteItem[] } => {
  try {
    const saved = localStorage.getItem('reqable_favorites');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { folders: [{ id: 'default', name: 'My Favorites' }], items: [] };
};

export interface ExplorerProps {
  requests: NetworkRequest[];
  onSelectRequest: (id: string) => void;
  onFilterByDomain: (domain: string | null) => void;
  onFilterByBookmark: (pattern: string | null) => void;
  selectedDomain: string | null;
  selectedBookmark: string | null;
}

export const Explorer: React.FC<ExplorerProps> = ({
  requests,
  onSelectRequest,
  onFilterByDomain,
  onFilterByBookmark,
  selectedDomain,
  selectedBookmark
}) => {
  const [activeView, setActiveView] = useState<ExplorerView>('domain');
  const [searchText, setSearchText] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  // 书签和收藏状态
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['default']));
  
  // 持久化
  useEffect(() => {
    localStorage.setItem('reqable_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);
  
  useEffect(() => {
    localStorage.setItem('reqable_favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // 按域名分组
  const domainGroups = useMemo(() => {
    const groups: Record<string, NetworkRequest[]> = {};
    requests.forEach(req => {
      try {
        const hostname = new URL(req.url).hostname;
        if (!groups[hostname]) groups[hostname] = [];
        groups[hostname].push(req);
      } catch {
        if (!groups['Other']) groups['Other'] = [];
        groups['Other'].push(req);
      }
    });
    return Object.entries(groups)
      .filter(([domain]) => !searchText || domain.toLowerCase().includes(searchText.toLowerCase()))
      .sort((a, b) => b[1].length - a[1].length);
  }, [requests, searchText]);
  
  // 构建 URL 结构树
  const structureTree = useMemo(() => {
    const tree: Record<string, TreeNode> = {};
    
    requests.forEach(req => {
      try {
        const url = new URL(req.url);
        const parts = [url.hostname, ...url.pathname.split('/').filter(Boolean)];
        
        let current = tree;
        parts.forEach((part, idx) => {
          if (!current[part]) {
            current[part] = { _children: {}, _requests: [] };
          }
          if (idx === parts.length - 1) {
            current[part]._requests.push(req);
          }
          current = current[part]._children;
        });
      } catch {}
    });
    
    return tree;
  }, [requests]);
  
  // 切换域名展开
  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };
  
  // 切换路径展开
  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };
  
  // 切换文件夹展开
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };
  
  // 添加书签
  const addBookmark = (urlPattern: string, name?: string) => {
    const newItem: BookmarkItem = {
      id: `bm-${Date.now()}`,
      name: name || urlPattern,
      urlPattern,
      folderId: 'default'
    };
    setBookmarks(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  // 删除书签
  const removeBookmark = (id: string) => {
    setBookmarks(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // 添加收藏
  const addFavorite = (request: NetworkRequest) => {
    const newItem: FavoriteItem = {
      id: `fav-${Date.now()}`,
      requestId: request.id,
      name: new URL(request.url).pathname || request.url,
      url: request.url,
      method: request.method,
      folderId: 'default'
    };
    setFavorites(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  // 删除收藏
  const removeFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // 渲染结构树节点
  const renderTreeNode = (node: TreeNode, name: string, path: string, depth: number = 0): React.ReactNode => {
    const hasChildren = Object.keys(node._children || {}).length > 0;
    const hasRequests = (node._requests || []).length > 0;
    const isExpanded = expandedPaths.has(path);
    
    return (
      <div key={path}>
        <div 
          className={`flex items-center gap-1 py-1 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px] ${depth > 0 ? 'ml-' + (depth * 3) : ''}`}
          style={{ paddingLeft: depth * 12 + 8 }}
          onClick={() => {
            if (hasChildren || hasRequests) togglePath(path);
            if (hasRequests && node._requests.length === 1) {
              onSelectRequest(node._requests[0].id);
            }
          }}
        >
          {(hasChildren || hasRequests) ? (
            isExpanded ? <ChevronDown size={12} className="text-gray-500 shrink-0" /> : <ChevronRight size={12} className="text-gray-500 shrink-0" />
          ) : <span className="w-3" />}
          
          {depth === 0 ? (
            <Globe size={12} className="text-[#4ec9b0] shrink-0" />
          ) : hasChildren ? (
            <FolderTree size={12} className="text-[#dcb67a] shrink-0" />
          ) : (
            <FileText size={12} className="text-gray-500 shrink-0" />
          )}
          
          <span className="truncate text-gray-300">{name}</span>
          
          {hasRequests && (
            <span className="text-[10px] text-gray-500 ml-auto">({node._requests.length})</span>
          )}
        </div>
        
        {isExpanded && (
          <>
            {Object.entries(node._children || {}).map(([childName, childNode]) => 
              renderTreeNode(childNode, childName, `${path}/${childName}`, depth + 1)
            )}
            {hasRequests && node._requests.map((req: NetworkRequest) => (
              <div
                key={req.id}
                className="flex items-center gap-1 py-1 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px]"
                style={{ paddingLeft: (depth + 1) * 12 + 8 }}
                onClick={() => onSelectRequest(req.id)}
              >
                <span className="w-3" />
                {req.url.startsWith('https') ? (
                  <Lock size={10} className="text-[#4ec9b0] shrink-0" />
                ) : (
                  <FileText size={10} className="text-gray-500 shrink-0" />
                )}
                <span className={`text-[10px] font-bold w-8 shrink-0 ${
                  req.method === 'GET' ? 'text-[#4ec9b0]' : 
                  req.method === 'POST' ? 'text-[#ce9178]' : 
                  req.method === 'PUT' ? 'text-[#569cd6]' : 
                  req.method === 'DELETE' ? 'text-[#f48771]' : 'text-gray-400'
                }`}>{req.method}</span>
                <span className="truncate text-gray-400">{req.status || '...'}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };
  
  // Tab 按钮
  const TabButton: React.FC<{ view: ExplorerView; icon: React.ElementType; label: string }> = ({ view, icon: Icon, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] border-b-2 transition-colors ${
        activeView === view 
          ? 'text-[#4ec9b0] border-[#4ec9b0]' 
          : 'text-gray-500 border-transparent hover:text-gray-300'
      }`}
      title={label}
    >
      <Icon size={12} />
    </button>
  );
  
  return (
    <div className="w-[220px] bg-[#252526] border-r border-[#3c3c3c] flex flex-col min-h-0" data-testid="explorer-panel">
      {/* Tab Bar */}
      <div className="h-8 flex border-b border-[#3c3c3c] shrink-0">
        <TabButton view="domain" icon={Globe} label="Domain" />
        <TabButton view="structure" icon={FolderTree} label="Structure" />
        <TabButton view="bookmark" icon={Bookmark} label="Bookmark" />
        <TabButton view="favorite" icon={Star} label="Favorite" />
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Domain View */}
        {activeView === 'domain' && (
          <div className="p-1" data-testid="domain-view">
            {domainGroups.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-8">No requests yet</div>
            ) : (
              domainGroups.map(([domain, reqs]) => (
                <div key={domain} data-testid="domain-group">
                  <div 
                    className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer text-[11px] ${
                      selectedDomain === domain ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-gray-300'
                    }`}
                    onClick={() => {
                      onFilterByDomain(selectedDomain === domain ? null : domain);
                      toggleDomain(domain);
                    }}
                    data-testid="domain-item"
                  >
                    {expandedDomains.has(domain) ? (
                      <ChevronDown size={12} className="text-gray-500 shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="text-gray-500 shrink-0" />
                    )}
                    <Globe size={12} className="text-[#4ec9b0] shrink-0" />
                    <span className="truncate flex-1">{domain}</span>
                    <span className="text-[10px] text-gray-500" data-testid="domain-count">({reqs.length})</span>
                  </div>
                  
                  {expandedDomains.has(domain) && (
                    <div className="ml-4">
                      {reqs.slice(0, 20).map(req => (
                        <div
                          key={req.id}
                          className="flex items-center gap-1 py-1 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px]"
                          onClick={() => onSelectRequest(req.id)}
                        >
                          <span className={`text-[10px] font-bold w-10 shrink-0 ${
                            req.method === 'GET' ? 'text-[#4ec9b0]' : 
                            req.method === 'POST' ? 'text-[#ce9178]' : 
                            req.method === 'PUT' ? 'text-[#569cd6]' : 
                            req.method === 'DELETE' ? 'text-[#f48771]' : 'text-gray-400'
                          }`}>{req.method}</span>
                          <span className="truncate text-gray-400" title={req.url}>
                            {new URL(req.url).pathname || '/'}
                          </span>
                        </div>
                      ))}
                      {reqs.length > 20 && (
                        <div className="text-[10px] text-gray-500 px-2 py-1">
                          ... and {reqs.length - 20} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Structure View */}
        {activeView === 'structure' && (
          <div className="p-1" data-testid="structure-view">
            {Object.keys(structureTree).length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-8">No requests yet</div>
            ) : (
              Object.entries(structureTree).map(([name, node]) => 
                renderTreeNode(node, name, name, 0)
              )
            )}
          </div>
        )}
        
        {/* Bookmark View */}
        {activeView === 'bookmark' && (
          <div className="p-1" data-testid="bookmark-view">
            {bookmarks.folders.map(folder => (
              <div key={folder.id}>
                <div 
                  className="flex items-center gap-1 py-1.5 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px]"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown size={12} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={12} className="text-gray-500" />
                  )}
                  <FolderTree size={12} className="text-[#dcb67a]" />
                  <span className="text-gray-300">{folder.name}</span>
                  <span className="text-[10px] text-gray-500 ml-auto">
                    ({bookmarks.items.filter(i => i.folderId === folder.id).length})
                  </span>
                </div>
                
                {expandedFolders.has(folder.id) && (
                  <div className="ml-4">
                    {bookmarks.items
                      .filter(item => item.folderId === folder.id)
                      .map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-[11px] group ${
                            selectedBookmark === item.urlPattern ? 'bg-[#37373d] text-white' : 'hover:bg-[#37373d] text-gray-400'
                          }`}
                          onClick={() => onFilterByBookmark(selectedBookmark === item.urlPattern ? null : item.urlPattern)}
                          data-testid="bookmark-item"
                        >
                          <Bookmark size={10} className="text-[#569cd6] shrink-0" />
                          <span className="truncate flex-1">{item.name}</span>
                          <button 
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#4a4a4a] rounded"
                            onClick={(e) => { e.stopPropagation(); removeBookmark(item.id); }}
                          >
                            <X size={10} className="text-gray-500" />
                          </button>
                        </div>
                      ))}
                    {bookmarks.items.filter(i => i.folderId === folder.id).length === 0 && (
                      <div className="text-[10px] text-gray-500 px-2 py-1">No bookmarks</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Quick add from domains */}
            {domainGroups.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#3c3c3c]">
                <div className="text-[10px] text-gray-500 px-2 py-1 uppercase">Quick Add</div>
                {domainGroups.slice(0, 5).map(([domain]) => (
                  <div
                    key={domain}
                    className="flex items-center gap-1 py-1 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px] text-gray-400"
                    onClick={() => addBookmark(`https://${domain}/*`, domain)}
                  >
                    <Plus size={10} className="text-gray-500" />
                    <span className="truncate">{domain}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Favorite View */}
        {activeView === 'favorite' && (
          <div className="p-1" data-testid="favorite-view">
            {favorites.folders.map(folder => (
              <div key={folder.id}>
                <div 
                  className="flex items-center gap-1 py-1.5 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px]"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown size={12} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={12} className="text-gray-500" />
                  )}
                  <Star size={12} className="text-[#dcdcaa]" />
                  <span className="text-gray-300">{folder.name}</span>
                  <span className="text-[10px] text-gray-500 ml-auto">
                    ({favorites.items.filter(i => i.folderId === folder.id).length})
                  </span>
                </div>
                
                {expandedFolders.has(folder.id) && (
                  <div className="ml-4">
                    {favorites.items
                      .filter(item => item.folderId === folder.id)
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1 py-1 px-2 hover:bg-[#37373d] rounded cursor-pointer text-[11px] group"
                          onClick={() => {
                            const req = requests.find(r => r.id === item.requestId);
                            if (req) onSelectRequest(req.id);
                          }}
                        >
                          <span className={`text-[10px] font-bold w-10 shrink-0 ${
                            item.method === 'GET' ? 'text-[#4ec9b0]' : 
                            item.method === 'POST' ? 'text-[#ce9178]' : 
                            item.method === 'PUT' ? 'text-[#569cd6]' : 
                            item.method === 'DELETE' ? 'text-[#f48771]' : 'text-gray-400'
                          }`}>{item.method}</span>
                          <span className="truncate flex-1 text-gray-400" title={item.url}>{item.name}</span>
                          <button 
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#4a4a4a] rounded"
                            onClick={(e) => { e.stopPropagation(); removeFavorite(item.id); }}
                          >
                            <X size={10} className="text-gray-500" />
                          </button>
                        </div>
                      ))}
                    {favorites.items.filter(i => i.folderId === folder.id).length === 0 && (
                      <div className="text-[10px] text-gray-500 px-2 py-1">No favorites</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Search Box */}
      <div className="h-8 border-t border-[#3c3c3c] px-2 flex items-center shrink-0">
        <Search size={12} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Filter..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 bg-transparent text-[11px] text-gray-300 outline-none placeholder-gray-600"
          data-testid="explorer-search"
        />
        {searchText && (
          <button onClick={() => setSearchText('')} className="p-0.5 hover:bg-[#37373d] rounded">
            <X size={10} className="text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

// 导出添加收藏/书签的工具函数（供右键菜单使用）
export const useExplorerActions = () => {
  const addBookmarkFromUrl = (url: string) => {
    try {
      const saved = localStorage.getItem('reqable_bookmarks');
      const bookmarks = saved ? JSON.parse(saved) : { folders: [{ id: 'default', name: 'My Bookmarks' }], items: [] };
      const hostname = new URL(url).hostname;
      const newItem = {
        id: `bm-${Date.now()}`,
        name: hostname,
        urlPattern: `https://${hostname}/*`,
        folderId: 'default'
      };
      bookmarks.items.push(newItem);
      localStorage.setItem('reqable_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  };
  
  const addFavoriteFromRequest = (request: NetworkRequest) => {
    try {
      const saved = localStorage.getItem('reqable_favorites');
      const favorites = saved ? JSON.parse(saved) : { folders: [{ id: 'default', name: 'My Favorites' }], items: [] };
      const newItem = {
        id: `fav-${Date.now()}`,
        requestId: request.id,
        name: new URL(request.url).pathname || request.url,
        url: request.url,
        method: request.method,
        folderId: 'default'
      };
      favorites.items.push(newItem);
      localStorage.setItem('reqable_favorites', JSON.stringify(favorites));
    } catch {}
  };
  
  return { addBookmarkFromUrl, addFavoriteFromRequest };
};
