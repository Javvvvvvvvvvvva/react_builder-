import React, { useState } from 'react';
import ShapeControls from './components/ShapeControls';
import CanvasScene from './components/CanvasScene';
import InspectorPanel from './components/InspectorPanel';
import DownloadButton from './components/DownloadButton';
import WelcomePopup from './components/WelcomePopup'; 
import './App.css';

export default function App() {
  const [selectedMesh, setSelectedMesh] = useState(null);

  return (
    <>
      <WelcomePopup /> {/* ✅ Shows on first load */}
      <ShapeControls />
      <DownloadButton />
      <CanvasScene onSelectMesh={setSelectedMesh} />
      <InspectorPanel selectedMesh={selectedMesh} />
    </>
  );
}
