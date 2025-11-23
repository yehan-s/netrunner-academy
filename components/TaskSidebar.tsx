
import React, { useState, useMemo, useEffect } from 'react';
import { CaseStudy } from '../types';
import { CheckCircle2, ChevronRight, ChevronDown, BookOpen, Shield, Zap, Terminal, Bug, Code2, List, Target, Wrench } from 'lucide-react';

interface TaskSidebarProps {
  caseStudy: CaseStudy;
  allCases: CaseStudy[];
  onSelectCase: (id: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ caseStudy, allCases, onSelectCase }) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'list'>('brief');
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Basics': true,
    'Security': true,
    'Advanced': true,
    'Debugging': true,
    'Reverse': true,
    'Reqable': true
  });

  // Auto-switch to Brief tab when a new case is selected
  useEffect(() => {
    setActiveTab('brief');
  }, [caseStudy.id]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedCases = useMemo(() => {
    const groups: Record<string, CaseStudy[]> = {};
    allCases.forEach(c => {
        if (!groups[c.category]) groups[c.category] = [];
        groups[c.category].push(c);
    });
    return groups;
  }, [allCases]);

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'Basics': return <Terminal size={14} className="text-blue-400" />;
        case 'Security': return <Shield size={14} className="text-red-400" />;
        case 'Debugging': return <Bug size={14} className="text-purple-400" />;
        case 'Reverse': return <Code2 size={14} className="text-green-400" />;
        case 'Advanced': return <Zap size={14} className="text-yellow-400" />;
        case 'Reqable': return <Wrench size={14} className="text-orange-400" />;
        default: return <BookOpen size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="w-80 bg-[#1e1e1e] border-r border-[#333] flex flex-col h-full text-gray-300 flex-shrink-0 z-50 shadow-2xl">
      
      {/* Header */}
      <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-blue-500 font-mono">{`{NR}`}</span>
            NetRunner
        </h1>
        <p className="text-xs text-gray-500 mt-1">Web Security Simulator</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#252526]">
        <button 
            onClick={() => setActiveTab('brief')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'brief' 
                ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-blue-400' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'
            }`}
        >
            <BookOpen size={14} />
            Mission Brief
        </button>
        <div className="w-[1px] bg-[#333]"></div>
        <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'list' 
                ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-blue-400' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'
            }`}
        >
            <List size={14} />
            Mission Select
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#1e1e1e] relative">
        
        {/* --- TAB 1: MISSION BRIEF (GUIDE) --- */}
        {activeTab === 'brief' && (
            <div className="p-5 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                        caseStudy.difficulty === 'Beginner' ? 'border-green-800 text-green-400 bg-green-900/20' : 
                        caseStudy.difficulty === 'Intermediate' ? 'border-yellow-800 text-yellow-400 bg-yellow-900/20' :
                        'border-red-800 text-red-400 bg-red-900/20'
                    }`}>
                        {caseStudy.difficulty}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-400 bg-gray-800 uppercase">
                        {caseStudy.category}
                    </span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-4 leading-tight">{caseStudy.title}</h2>
                
                <div className="bg-[#252526] p-3 rounded border border-[#333] mb-6">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {caseStudy.description}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Learning Objectives */}
                    <div>
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target size={14} />
                            Objectives
                        </h3>
                        <ul className="space-y-2">
                            {caseStudy.learningObjectives.map((obj, i) => (
                                <li key={i} className="flex gap-2 text-sm text-gray-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Step-by-Step Guide */}
                    <div>
                        <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Terminal size={14} />
                            Execution Guide
                        </h3>
                        <div className="space-y-0 relative pl-2">
                            {/* Timeline line */}
                            <div className="absolute left-[15px] top-2 bottom-4 w-[1px] bg-[#333]"></div>
                            
                            {caseStudy.guideSteps.map((step, idx) => (
                                <div key={idx} className="relative pl-10 pb-6 group">
                                    <div className="absolute left-0 top-0 w-8 h-6 flex items-center justify-center bg-[#1e1e1e]">
                                        <div className="w-6 h-6 rounded-full bg-[#2a2a2a] border border-[#444] group-hover:border-yellow-500/50 group-hover:text-yellow-500 transition-colors text-xs font-bold flex items-center justify-center text-gray-500 z-10">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{step.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed group-hover:text-gray-400 transition-colors">{step.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: MISSION LIST --- */}
        {activeTab === 'list' && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="p-4">
                    <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 pl-2">Available Scenarios</h3>
                    <div className="space-y-3">
                        {(Object.entries(groupedCases) as [string, CaseStudy[]][]).map(([category, cases]) => (
                            <div key={category} className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
                                <button 
                                    onClick={() => toggleCategory(category)}
                                    className="flex items-center gap-3 w-full text-left p-3 text-sm font-bold text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                                >
                                    {getCategoryIcon(category)}
                                    <span className="flex-1">{category}</span>
                                    {expandedCategories[category] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                                </button>
                                
                                {expandedCategories[category] && (
                                    <div className="border-t border-[#333] bg-[#1e1e1e]">
                                        {cases.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => onSelectCase(c.id)}
                                                className={`w-full text-left px-3 py-3 text-xs flex items-center justify-between group transition-all border-l-2 ${
                                                    c.id === caseStudy.id 
                                                    ? 'bg-blue-900/10 text-blue-400 border-blue-500' 
                                                    : 'border-transparent text-gray-400 hover:bg-[#252526] hover:text-gray-200'
                                                }`}
                                            >
                                                <span className="truncate font-medium">{c.title}</span>
                                                {c.id === caseStudy.id && <CheckCircle2 size={12} className="text-blue-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
