import React, { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import { SkullModel } from './SkullModel';
import { CAMERA_CONFIG, CONTROLS_CONFIG } from '../lib/constants';
import { Controls } from './Controls';
import { SceneControls } from './SceneControls';
import { useSceneTransition } from '../lib/hooks/useSceneTransition';

// Scene component to handle scene-related logic
function Scene({ onSceneReady }: { onSceneReady: (scene: THREE.Scene) => void }) {
  const { scene } = useThree();
  
  useEffect(() => {
    onSceneReady(scene);
  }, [scene, onSceneReady]);

  return null;
}

/**
 * SkullViewer Component
 * 
 * Main container component for the 3D dental visualization.
 * Sets up the scene, camera, and lighting configuration.
 * 
 * @returns {JSX.Element} The complete 3D viewer interface
 */
export function SkullViewer() {
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const controlsRef = useRef();
  const { currentView, isTransitioning, handleViewChange } = useSceneTransition();

  const handleSceneReady = useCallback((sceneInstance: THREE.Scene) => {
    setScene(sceneInstance);
  }, []);

  // Handle double click on background
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      // Prevent text selection
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
      
      // Only handle double clicks on the canvas background
      if (e.target instanceof HTMLCanvasElement) {
        setAutoRotate(false);
        setSelectedTooth(null);
        if (controlsRef.current) {
          controlsRef.current.reset();
          controlsRef.current.update();
        }
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('dblclick', handleDoubleClick);
      return () => canvas.removeEventListener('dblclick', handleDoubleClick);
    }
  }, []);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.update();
    }
    setAutoRotate(false);
  };

  const handleAutoRotate = (value: boolean) => setAutoRotate(value);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden bg-white"
      style={{ userSelect: 'none' }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/80 via-white/50 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Interactive Dental Model</h1>
          <p className="text-sm text-gray-600">
            Explore the dental anatomy by hovering over different parts of the model. 
            Use the mouse to rotate, scroll to zoom, and the controls below to automate rotation.
          </p>
        </div>
      </div>

      <SceneControls 
        currentView={currentView}
        onViewChange={(view) => scene && handleViewChange(view, scene)}
      />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={CAMERA_CONFIG}
      >
        <Scene onSceneReady={handleSceneReady} />
        <color attach="background" args={['black']} />
        
        {/* Professional lighting setup */}
        <ambientLight intensity={0.5} color="#90caf9" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.7}
          color="#64b5f6"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <hemisphereLight 
          intensity={0.5} 
          groundColor="#1e88e5"
          color="#f5f5f5" 
        />
        <pointLight
          position={[-5, 5, -5]}
          intensity={0.4}
          color="#2196f3"
          distance={20}
          decay={2}
        />

        {/* Environment for better reflections */}
        <Environment
          preset="warehouse"
          background={false}
          blur={0.5}
        />

        <Suspense fallback={
          <Html center>
            <div className="text-gray-800 text-lg font-medium">
              Loading dental model...
            </div>
          </Html>
        }>
          <SkullModel onToothSelect={setSelectedTooth} />
          <OrbitControls
            {...CONTROLS_CONFIG}
            makeDefault
            ref={controlsRef}
            autoRotate={autoRotate}
          /> 
        </Suspense>
      </Canvas>
      
      <Controls 
        autoRotate={autoRotate}
        setAutoRotate={handleAutoRotate}
        onReset={handleReset}
      /> 
    </div>
  );
}