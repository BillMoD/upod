import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { MODEL_CONFIG, MODEL_URL } from '../lib/constants';
import { ToothTag } from './ToothTag';
import { createDefaultMaterial, createHighlightMaterial, createSkullMaterial } from '../lib/materials';
import { isToothMesh, isSkullMesh, calculateTooltipPosition } from '../lib/utils/toothUtils';
import { useToothInteraction } from '../lib/hooks/useToothInteraction';
import { getToothData } from '../lib/data/teethData';
import gsap from 'gsap';

interface HoveredTooth {
  name: string;
  position: THREE.Vector3;
}

interface SkullModelProps {
  onToothSelect: (toothName: string | null) => void;
}

/**
 * SkullModel Component for rendering and managing the interactive dental model.
 * Implements professional hover interactions and material management.
 */
export function SkullModel({ onToothSelect }: SkullModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const [hoveredTooth, setHoveredTooth] = useState<HoveredTooth | null>(null);
  const { state, handlers } = useToothInteraction();
  const { camera } = useThree();

  // Handle background click to reset scene
  const handleBackgroundClick = useCallback((e: THREE.Event) => {
    e.stopPropagation();
    
    // Reset all materials
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (isSkullMesh(child.name)) {
          child.material = createSkullMaterial();
        } else if (isToothMesh(child.name)) {
          child.material = child.userData.originalMaterial?.clone() || createDefaultMaterial();
        }
      }
    });
    
    // Reset camera
    gsap.to(camera.position, {
      x: CAMERA_CONFIG.position[0],
      y: CAMERA_CONFIG.position[1],
      z: CAMERA_CONFIG.position[2],
      duration: 1,
      ease: 'power2.inOut'
    });
    
    // Clear selection
    onToothSelect(null);
  }, [scene, camera, onToothSelect]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Store original geometry for later use
        child.userData.originalGeometry = child.geometry;

        // Apply appropriate materials based on mesh type
        if (isSkullMesh(child.name)) {
          child.material = createSkullMaterial();
          child.renderOrder = 1; // Render skull first
        } else if (isToothMesh(child.name)) {
          child.material = createDefaultMaterial();
          child.userData.originalMaterial = child.material.clone();
          child.renderOrder = 2; // Render teeth after skull
        }
        
        // Enable interactions
        if (isToothMesh(child.name)) {
          child.userData.interactive = true;
          // Ensure teeth are always visible through skull
          child.material.depthWrite = true;
          child.material.depthTest = true;
        }
      }
    });

    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material?.dispose();
          child.geometry.dispose();
          if (child.userData.originalMaterial) {
            child.userData.originalMaterial.dispose();
          }
        }
      });
    };
  }, [scene]);

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    
    // console.log('Hover event on mesh:', mesh.name);
    
    if (!mesh?.isMesh || !isToothMesh(mesh.name) || state.isSelected || state.isTransitioning) {
      // console.log('Hover rejected:', {
      //   isMesh: mesh?.isMesh,
      //   isToothMesh: isToothMesh(mesh.name),
      //   isSelected: state.isSelected,
      //   isTransitioning: state.isTransitioning
      // });
      return;
    }

    // Store current material
    mesh.userData.previousMaterial = mesh.material;
    
    // Apply highlight material
    const highlightMaterial = createHighlightMaterial();
    mesh.material = highlightMaterial;
    
    // Calculate tooltip position
    const tooltipPos = calculateTooltipPosition(mesh);
    // console.log('Tooltip position calculated:', tooltipPos);
    
    // Get tooth data
    const toothData = getToothData(mesh.name);
    // console.log('Tooth data:', toothData);
    
    // Update state
    setHoveredTooth({
      name: mesh.name,
      position: tooltipPos,
      data: toothData
    });
    
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: THREE.Event) => {
    const mesh = e.object as THREE.Mesh;
    if (!mesh?.isMesh || !isToothMesh(mesh.name) || state.isSelected) return;

    // Restore previous material
    mesh.material = mesh.userData.previousMaterial || 
                   mesh.userData.originalMaterial || 
                   createDefaultMaterial();
    
    mesh.userData.previousMaterial = null;
    setHoveredTooth(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = useCallback((e: THREE.Event) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    if (!mesh?.isMesh || !isToothMesh(mesh.name) || state.isTransitioning) return;
    
    // Store the clicked tooth's position for the tag and camera
    const bbox = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    
    // Calculate camera position without rotation
    const cameraOffset = new THREE.Vector3(2, 0, 2); // Remove Y offset to prevent rotation
    const targetCameraPosition = center.clone().add(cameraOffset);
    
    // Animate camera to new position while maintaining orientation
    gsap.to(camera.position, {
      x: targetCameraPosition.x,
      y: camera.position.y, // Keep current Y position
      z: targetCameraPosition.z,
      duration: 1,
      ease: 'power2.inOut'
    });
    
    center.x += 0.5; // Offset tag position for better visibility
    
    // Clear any existing hover states
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && isToothMesh(child.name)) {
        if (child !== mesh) {
          child.material = createDefaultMaterial();
          child.userData.previousMaterial = null;
        }
      }
    });
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (isSkullMesh(child.name)) {
          child.material = createSkullMaterial();
          child.renderOrder = 1;
        } else if (isToothMesh(child.name)) {
          if (child === mesh) {
            const highlightMat = createHighlightMaterial();
            highlightMat.emissiveIntensity = 0.8;
            child.material = highlightMat;
            child.renderOrder = 3;
          } else {
            child.material = createDefaultMaterial();
            child.renderOrder = 2;
          }
        }
      }
    });

    handlers.handleToothClick(mesh.name, center);
    onToothSelect(mesh.name);
    setHoveredTooth({
      name: mesh.name,
      position: center
    });
    document.body.style.cursor = 'default';
  }, [scene, handlers, onToothSelect, state.isTransitioning, camera]);

  // Handle background click
  useEffect(() => {
    const handleBackgroundClick = (e: MouseEvent) => {
      // Only handle clicks on the canvas background
      if (!(e.target instanceof HTMLCanvasElement) || 
          !state.isSelected || 
          state.isTransitioning) {
        return;
      }

      // Get the clicked point in normalized device coordinates
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Check if we clicked on empty space (not a tooth)
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // If we didn't hit any objects or hit the skull, reset the state
      if (intersects.length === 0 || isSkullMesh((intersects[0].object as THREE.Mesh).name)) {
        // Reset all materials
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (isSkullMesh(child.name)) {
              child.material = createSkullMaterial();
            } else if (isToothMesh(child.name)) {
              child.material = createDefaultMaterial();
              child.userData.previousMaterial = null;
            }
          }
        });

        setHoveredTooth(null);
        handlers.handleClose();
        onToothSelect(null);
      }
    };

    window.addEventListener('click', handleBackgroundClick);
    return () => window.removeEventListener('click', handleBackgroundClick);
  }, [handlers, onToothSelect, state.isSelected, state.isTransitioning, scene, camera]);

  // Handle double click to reset
  useEffect(() => {
    const handleDoubleClick = () => {
      if (!state.isSelected) return;
      
      const defaultSkullMaterial = createSkullMaterial();
      const defaultToothMaterial = createDefaultMaterial();

      // Reset all materials first
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (isSkullMesh(child.name)) {
            child.material = defaultSkullMaterial;
          } else if (isToothMesh(child.name)) {
            child.material = defaultToothMaterial;
            child.userData.previousMaterial = null;
          }
        }
      });
      
      // Reset camera with animation
      const duration = 1;
      const startPosition = camera.position.clone();
      const targetPosition = new THREE.Vector3(0, 0, 3);
      
      const animate = (t: number) => {
        const progress = Math.min(t / duration, 1);
        const easeProgress = progress * (2 - progress);
        
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame((timestamp) => animate((timestamp - startTime) / 1000));
        }
      };
      
      const startTime = performance.now();
      requestAnimationFrame((timestamp) => animate(0));
      
      handlers.handleClose();
      onToothSelect(null);
      setHoveredTooth(null);
      document.body.style.cursor = 'default';
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('dblclick', handleDoubleClick);
      return () => canvas.removeEventListener('dblclick', handleDoubleClick);
    }
  }, [scene, handlers, onToothSelect]);

  return (
    <group>
      <primitive
        object={scene}
        scale={[1, 1, 1]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      {hoveredTooth && !state.isTransitioning && (
        <ToothTag
          meshName={hoveredTooth.name}
          position={hoveredTooth.position}
          isHovered={!state.isSelected}
          isSelected={state.selectedTooth === hoveredTooth.name}
          isTransitioning={state.isTransitioning}
          onClick={(e) => {
            e.stopPropagation();
            if (!state.isTransitioning) {
              handlers.handleToothClick(hoveredTooth.name, hoveredTooth.position);
              onToothSelect(hoveredTooth.name);
            }
          }}
        />
      )}
    </group>
  );
}