import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { TreeState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Scene */}
      <Scene treeState={treeState} />
      
      {/* UI Overlay */}
      <UI treeState={treeState} onToggle={toggleState} />
    </div>
  );
}

export default App;