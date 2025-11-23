import React from 'react';
import { Level } from '../types';
import { BookOpen, Play, ChevronRight } from 'lucide-react';

interface LearningModuleProps {
  level: Level;
  onStart: () => void;
}

export const LearningModule: React.FC<LearningModuleProps> = ({ level, onStart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-500">
      <div className="bg-gray-900 border-2 border-emerald-500/50 w-full max-w-4xl rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-800 p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1">NetRunner 学院 // 课程 {level.id}</div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="text-emerald-400" />
              {level.learningContent.topic}
            </h2>
          </div>
          <div className="text-right hidden md:block">
             <div className="text-gray-400 text-sm">目标技能</div>
             <div className="text-emerald-300 font-mono">{level.type}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8 text-gray-300 leading-relaxed">
          
          <section>
            <h3 className="text-xl font-bold text-white mb-3 border-l-4 border-blue-500 pl-3">核心原理</h3>
            <p className="whitespace-pre-line text-lg">
              {level.learningContent.theory}
            </p>
          </section>

          <section className="bg-black/40 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">操作指南</h3>
            <p className="whitespace-pre-line font-mono text-sm text-yellow-100/80">
              {level.learningContent.guide}
            </p>
          </section>

          <div className="bg-gray-800/50 p-4 rounded text-sm text-gray-400 italic">
            任务简报: {level.description}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-900 border-t border-gray-800 flex justify-end">
          <button 
            onClick={onStart}
            className="group bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold py-3 px-8 rounded flex items-center gap-2 transition-all transform hover:scale-105"
          >
            开始实战演练
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};