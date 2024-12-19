import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { createDefaultMaterial, createHighlightMaterial } from '../materials';
import { isToothMesh, calculateTooltipPosition } from '../utils/toothUtils';

/**
 * Interface for tooth interaction event handlers
 */
export interface ToothInteractionHandlers {
  handlePointerOver: (mesh: THREE.Mesh) => void;
  handlePointerOut: (mesh: THREE.Mesh) => void;
}

/**
 * Interface for tooth interaction state
 */
export interface ToothInteractionState {
  hoveredMesh: string | null;
  tooltipPosition: THREE.Vector3 | null;
  previousMaterial: THREE.Material | null;
  isSelected: boolean;
  selectedTooth: string | null;
  skullOpacity: number;
  isTransitioning: boolean;
}

/**
 * Custom hook for managing tooth interactions
 * 
 * Handles the state and event handlers for tooth hover interactions,
 * including mesh highlighting and tooltip positioning.
 * 
 * Features:
 * - Hover state management
 * - Material switching on hover
 * - Dynamic tooltip positioning
 * - Mesh interaction handlers
 * 
 * @returns {Object} Object containing interaction state and handlers
 */
export function useToothInteraction() {
  const { camera } = useThree();
  const [state, setState] = useState<ToothInteractionState>({
    hoveredMesh: null,
    tooltipPosition: null,
    previousMaterial: null,
    isSelected: false,
    selectedTooth: null,
    skullOpacity: 0.6,
    isTransitioning: false
  });

  const handlePointerOver = useCallback((mesh: THREE.Mesh) => {
    if (!mesh?.isMesh || !mesh.name || state.isSelected || state.isTransitioning) return;

    // Only proceed if this is a tooth mesh
    if (!isToothMesh(mesh.name)) return;

    // Store current state before modifications
    const currentMaterial = mesh.material;
    const tooltipPosition = calculateTooltipPosition(mesh);

    // Create new highlight material for each hover
    const highlightMaterial = createHighlightMaterial().clone();
    highlightMaterial.emissiveIntensity = 0.6;

    // Store original state
    mesh.userData.previousMaterial = currentMaterial;

    // Apply highlight effects
    mesh.material = highlightMaterial;

    setState(prev => ({
      ...prev,
      hoveredMesh: mesh.name,
      tooltipPosition,
      previousMaterial: currentMaterial,
    }));

    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback((mesh: THREE.Mesh) => {
    if (!mesh?.isMesh || !mesh.name || !isToothMesh(mesh.name)) return;

    if (mesh.userData.previousMaterial) {
      mesh.material = mesh.userData.previousMaterial;
    } else {
      mesh.material = createDefaultMaterial();
    }

    mesh.userData.previousMaterial = null;

    setState(prev => ({
      ...prev,
      hoveredMesh: null,
      tooltipPosition: null,
      previousMaterial: null,
    }));

    document.body.style.cursor = 'default';
  }, []);

  const handleToothClick = useCallback((toothName: string, position: THREE.Vector3) => {
    setState(prev => ({ ...prev, isTransitioning: true }));
    
    // Animate camera to focus position
    const targetPosition = {
      x: position.x + 1.5,
      y: position.y + 0.5,
      z: position.z + 1.5
    };

    // Smooth camera transition
    const duration = 1;
    const startPosition = camera.position.clone();
    
    const animate = (t: number) => {
      const progress = Math.min(t / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease out quad
      
      camera.position.set(
        startPosition.x + (targetPosition.x - startPosition.x) * easeProgress,
        startPosition.y + (targetPosition.y - startPosition.y) * easeProgress,
        startPosition.z + (targetPosition.z - startPosition.z) * easeProgress
      );
      
      if (progress < 1) {
        requestAnimationFrame((timestamp) => animate((timestamp - startTime) / 1000));
      } else {
        setState(prev => ({ ...prev, isTransitioning: false }));
      }
    };
    
    const startTime = performance.now();
    requestAnimationFrame((timestamp) => animate(0));

    setState(prev => ({
      ...prev,
      selectedTooth: toothName,
      isSelected: true,
      skullOpacity: 0.1
    }));
  }, [camera]);

  const handleClose = useCallback(() => {
    // Reset camera position
    camera.position.set(0, 0, 3);

    setState(prev => ({
      ...prev,
      selectedTooth: null,
      isSelected: false,
      skullOpacity: 0.6
    }));
  }, [camera]);

  return {
    state,
    handlers: {
      handlePointerOver,
      handlePointerOut,
      handleToothClick,
      handleClose
    },
  };
}