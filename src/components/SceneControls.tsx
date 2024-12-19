import React, { useState, useEffect, useRef } from 'react';
import { Layout, View } from 'lucide-react';

export type ViewMode = 'default' | 'perspective';

interface SceneControlsProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function SceneControls({ currentView, onViewChange }: SceneControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const viewOptions = [
    { id: 'default' as ViewMode, icon: Layout, label: 'Default View', description: 'Standard 3D view of the model' },
    { id: 'perspective' as ViewMode, icon: View, label: 'Perspective View', description: 'Enhanced depth perception view' }
  ];

  const handleViewChange = (view: ViewMode) => {
    // console.log(view)
    onViewChange(view);
    setIsOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = viewOptions.find(opt => opt.id === currentView) ?? viewOptions[0];
  // console.log(currentOption.label)
  // console.log(currentView)
  return (
    <div className="fixed top-32 left-6 z-50" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl p-3 
            shadow-lg border border-white/20 transition-all duration-200
            hover:bg-white hover:shadow-xl hover:scale-105
            ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          `}
        >
          {React.createElement(currentOption.icon, { className: "w-5 h-5 text-gray-700" })}
          <span className="text-sm font-medium text-gray-800">
            {currentOption.label}
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleViewChange(option.id)}
                className={`
                  w-full flex flex-col items-start gap-1 p-3 transition-all
                  hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl
                  ${currentView === option.id ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  {React.createElement(option.icon, { 
                    className: `w-5 h-5 ${
                      currentView === option.id ? 'text-blue-600' : 'text-gray-700'
                    }`
                  })}
                  <span className={`text-sm font-medium ${
                    currentView === option.id ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {option.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500 pl-7">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}