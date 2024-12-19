import { Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { getToothData } from '../lib/data/teethData';
import { useState, useRef, useEffect } from 'react';

interface ToothTagProps {
  meshName: string;
  position: Vector3;
  isHovered?: boolean;
  isSelected?: boolean;
  isTransitioning?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function ToothTag({ 
  meshName, 
  position, 
  isHovered = false,
  isSelected = false,
  isTransitioning = false,
  onClick 
}: ToothTagProps) {
  const { camera } = useThree();
  const toothData = getToothData(meshName);
  const htmlRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  
  // useEffect(() => {
  //   // console.log('ToothTag render state:', {
  //   //   meshName,
  //   //   isHovered,
  //   //   isSelected,
  //   //   hasToothData: !!toothData,
  //   //   position: position.toArray()
  //   // });
  // }, [meshName, isHovered, isSelected, toothData, position]);
  
  useEffect(() => {
    if (!position) return;
    
    const calculateScale = () => {
      const distanceToCamera = position.distanceTo(camera.position);
      const fov = camera.fov * (Math.PI / 180);
      const baseScale = Math.tan(fov / 2) * 0.4;
      
      return Math.min(Math.max(baseScale, 0.4), 1.0);
    };

    setScaleFactor(calculateScale());
  }, [position, camera, isSelected]);
  
  useFrame(() => {
    if (!position) return;
    
    const distanceToCamera = position.distanceTo(camera.position);
    const fov = camera.fov * (Math.PI / 180);
    const baseScale = Math.tan(fov / 2) * 0.4;
    setScaleFactor(Math.min(Math.max(baseScale, 0.4), 1.0));
  });

  if (!isHovered && !isSelected) return null;
  
  return (
    <group position={position}>
      <Html
        ref={htmlRef}
        center
        className={`tooth-tag ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        distanceFactor={scaleFactor}
        zIndexRange={[0, 100]}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isTransitioning ? 'none' : 'auto',
          opacity: isTransitioning ? 0 : 1,
          transform: `scale(${isSelected ? 1.1 : isHovered ? 1.05 : 1})`
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick && !isTransitioning) {
            e.preventDefault();
            onClick(e);
          }
        }}
      >
       <div className={`
    bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl 
    border border-gray-200/20 shadow-xl
    transition-all duration-300 ease-out
    ${isSelected ? 'w-[640px] h-[400px] max-w-[90vw] min-h-[200px]' : 'w-[240px] h-[120px] min-h-[120px]'}
    ${isHovered && !isSelected ? 'hover:shadow-2xl hover:bg-white hover:w-[320px] hover:h-[160px]' : ''}
    ${isSelected ? 'scale-in' : ''}
`}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-blue-50/80 px-3 py-2 rounded-md transition-colors backdrop-blur-sm">
              <span className="text-blue-700 font-mono text-sm font-bold tracking-tight">#{toothData.number}</span>
              <div className="w-2 h-2 rounded-full" style={{
                backgroundColor: 
                  toothData.status === 'healthy' ? '#4ade80' : 
                  toothData.status === 'treated' ? '#60a5fa' : 
                  toothData.status === 'needs-treatment' ? '#f87171' : '#94a3b8'
              }} />
            </div>
            <span className={`text-xs font-medium capitalize ml-auto ${
              toothData.status === 'healthy' ? 'text-green-600' :
              toothData.status === 'treated' ? 'text-blue-600' :
              toothData.status === 'needs-treatment' ? 'text-red-600' : 'text-gray-500'
            } transition-colors`}>
              {toothData.status.replace('-', ' ')}
            </span>
          </div>
          
          <div className="text-gray-800 text-sm font-semibold mt-2 transition-colors leading-relaxed">
            {toothData.name}
          </div>

          {isSelected && (
            <div className="mt-4 space-y-3 animate-slideIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-blue-50/80 p-3 rounded-lg backdrop-blur-sm hover:bg-blue-50 transition-colors">
                    <span className="text-xs text-blue-700 font-medium block mb-1">Last Treatment</span>
                    <span className="text-sm text-blue-900">{toothData.lastTreatment}</span>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-lg mt-2 backdrop-blur-sm hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-700 font-medium block mb-2">Treatment History</span>
                    <div className="space-y-2">
                      {toothData.history.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-md backdrop-blur-sm hover:bg-white transition-colors">
                          <span className="w-2 h-2 rounded-full bg-blue-500/50 flex-shrink-0" />
                          <span className="flex-grow break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-50/80 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-3 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-blue-500 rounded-full" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Treatment Video</p>
                        <p className="text-xs text-gray-500">Click to play procedure walkthrough</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50/80 p-3 rounded-lg backdrop-blur-sm">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Treatment Notes</h4>
                    <p className="text-sm text-blue-700">{toothData.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div 
            className="mt-3 text-xs text-blue-500 text-center font-medium tracking-wide transition-colors hover:text-blue-600 cursor-pointer"
            onClick={onClick}
          >
            {isSelected ? 'Click background to close' : 'Click for more details'}
          </div>
        </div>
      </Html>
    </group>
  );
}