import { useCallback, useState } from 'react';
import * as THREE from 'three';
import { ViewMode } from '../../components/SceneControls';
import { MODEL_HIERARCHY } from '../constants';

export function useSceneTransition() {
  const [currentView, setCurrentView] = useState<ViewMode>('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = useCallback((view: ViewMode, scene?: THREE.Scene) => {
    if (!scene) {
      console.warn('Scene is not yet initialized');
      return;
    }

    setIsTransitioning(true);
    setCurrentView(view);

    // Store original positions for reset
    if (!scene.userData.originalPositions) {
      scene.userData.originalPositions = new Map();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          scene.userData.originalPositions.set(obj.uuid, obj.position.clone());
        }
      });
    }

    // Handle different view transitions
    switch (view) {
      case 'exploded':
        handleExplodedView(scene);
        break;
      case '2d':
        handle2DView(scene);
        break;
      case 'orthographic':
        handleOrthographicView(scene);
        break;
      case 'perspective':
        handlePerspectiveView(scene);
        break;
      default:
        handleDefaultView(scene);
    }

    setTimeout(() => setIsTransitioning(false), 1000);
  }, []);

  return {
    currentView,
    isTransitioning,
    handleViewChange
  };
}

function handleExplodedView(scene: THREE.Scene) {
  const spacing = 0.2;
  let topOffset = 0;
  let bottomOffset = 0;

  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const isTop = obj.name.includes(MODEL_HIERARCHY.GROUPS.TOP);
    const isBottom = obj.name.includes(MODEL_HIERARCHY.GROUPS.BOTTOM);

    if (isTop) {
      obj.position.y += spacing + topOffset;
      topOffset += 0.05;
    } else if (isBottom) {
      obj.position.y -= spacing + bottomOffset;
      bottomOffset += 0.05;
    }
  });
}

function handle2DView(scene: THREE.Scene) {
  scene.rotation.set(0, 0, 0);
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.position.z = 0;
      obj.rotation.set(0, 0, 0);
    }
  });
}

function handleOrthographicView(scene: THREE.Scene) {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const originalPos = scene.userData.originalPositions.get(obj.uuid);
      if (originalPos) {
        obj.position.copy(originalPos);
      }
    }
  });
}

function handlePerspectiveView(scene: THREE.Scene) {
  // Hide original skull meshes
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && isSkullMesh(obj.name)) {
      obj.visible = false;
    }
  });

  // Create container for cloned teeth
  if (!scene.userData.clonedTeeth) {
    console.log("Creating cloned teeth container");
    scene.userData.clonedTeeth = new THREE.Group();
    scene.add(scene.userData.clonedTeeth);

    // Clone and arrange teeth in a grid
    const teeth: THREE.Mesh[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && !isSkullMesh(obj.name)) {
        console.log("Cloning tooth:", obj.name);
        const clone = obj.clone();
        clone.material = clone.material.clone();
        clone.material.side = THREE.DoubleSide;
        clone.material.depthWrite = true;
        clone.material.depthTest = true;
        clone.material.needsUpdate = true;
        // Add flag to identify cloned teeth
        clone.userData.isClone = true;
        teeth.push(clone);
      }
    });

    console.log("Total teeth cloned:", teeth.length);

    // Arrange in grid
    const gridSize = Math.ceil(Math.sqrt(teeth.length));
    const spacing = 0.05;
    
    teeth.forEach((tooth, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      const x = (col - gridSize/2) * spacing;
      const y = (row - gridSize/2) * spacing;
      tooth.position.set(x, y, 0);
      
      // console.log(`Positioning tooth at: x=${x}, y=${y}, z=2`);
      
      // Reset rotation
      tooth.rotation.set(0, 0, 0);
      
      scene.userData.clonedTeeth.add(tooth);
    });
  }

  // Show cloned teeth, hide originals
  if (scene.userData.clonedTeeth) {
    // console.log("Making cloned teeth visible");
    scene.userData.clonedTeeth.visible = true;
  }
  
  // Only hide original teeth (not clones)
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && !isSkullMesh(obj.name) && !obj.userData.isClone) {
      obj.visible = false;
    }
  });
}

function handleDefaultView(scene: THREE.Scene) {
  // Hide cloned teeth if they exist
  if (scene.userData.clonedTeeth) {
    scene.userData.clonedTeeth.visible = false;
  }

  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const originalPos = scene.userData.originalPositions.get(obj.uuid);
      if (originalPos) {
        obj.position.copy(originalPos);
      }
      
      // Restore visibility and interactions for original meshes
      if (!obj.userData.isClone) {
        obj.visible = true;
        if (isToothMesh(obj.name)) {
          obj.userData.interactive = true;
        }
      }
    }
  });
}

function isSkullMesh(name: string): boolean {
  const isSkull = name.includes('Skeletal_Cranium') || name.includes('Skeletal_Mandible');
  // console.log('Checking mesh:', name, 'Is skull:', isSkull);
  return isSkull;
}

function isToothMesh(name: string): boolean {
  return !isSkullMesh(name); // If it's not a skull mesh, it's a tooth mesh
}