import { Pause, Play, RotateCw } from 'lucide-react';

interface ControlsProps {
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  onReset: () => void;
}

/**
 * Controls Component
 * 
 * Renders the control panel for interacting with the 3D dental model.
 * Provides controls for auto-rotation and view reset functionality.
 * 
 * @param {ControlsProps} props Component props
 */
export function Controls({ autoRotate, setAutoRotate, onReset }: ControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg transition-all hover:bg-white/20">
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 active:scale-95"
        title={autoRotate ? 'Pause Rotation' : 'Start Rotation'}
      >
        {autoRotate ? (
          <Pause className="w-6 h-6 text-gray-800" />
        ) : (
          <Play className="w-6 h-6 text-gray-800" />
        )}
      </button>
      <button
        onClick={onReset}
        className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 active:scale-95"
        title="Reset View"
      >
        <RotateCw className="w-6 h-6 text-gray-800" />
      </button>
    </div>
  );
}