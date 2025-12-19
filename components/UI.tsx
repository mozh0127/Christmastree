import React from 'react';
import { TreeState } from '../types';

interface UIProps {
  treeState: TreeState;
  onToggle: () => void;
}

export const UI: React.FC<UIProps> = ({ treeState, onToggle }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <div className="flex flex-col items-start">
        <h1 
          className="font-serif text-3xl md:text-5xl lg:text-6xl text-yellow-100 tracking-tighter drop-shadow-lg whitespace-nowrap" 
          style={{ fontFamily: 'Playfair Display' }}
        >
          MERRY CHRISTMAS!
        </h1>
        <p className="text-emerald-200/60 font-sans tracking-widest text-[10px] md:text-xs mt-2 uppercase">
          By Momo 2025
        </p>
      </div>

      {/* Control Footer */}
      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        <button
          onClick={onToggle}
          className={`
            group relative px-8 py-3 bg-black/40 backdrop-blur-md border border-yellow-500/30
            text-yellow-100 font-serif tracking-widest uppercase transition-all duration-500
            hover:bg-yellow-900/40 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]
          `}
        >
          <span className="relative z-10 flex items-center gap-3">
             {treeState === TreeState.SCATTERED ? 'Assemble Tree' : 'Release Magic'}
             <span className={`block w-2 h-2 rounded-full bg-yellow-400 transition-opacity duration-300 ${treeState === TreeState.TREE_SHAPE ? 'animate-pulse' : 'opacity-20'}`}></span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>

        <div className="text-yellow-200/30 text-[10px] font-mono">
          HAPPINESS · SMILES · SUNSHINE
        </div>
      </div>
    </div>
  );
};