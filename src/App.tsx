import React from 'react';
import { SkullViewer } from './components/SkullViewer';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-white">Interactive Dental Model</h1>
          <p className="text-sm text-white/80">
            Explore the dental anatomy by hovering over different parts of the model. 
            Use the mouse to rotate, scroll to zoom, and the controls below to automate rotation.
          </p>
        </div>
      </div>
      <SkullViewer />
    </div>
  );
}

export default App;
