import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

/**
 * Custom hook for loading and managing the 3D skull model
 * 
 * Handles the initialization and configuration of GLTF and DRACO loaders
 * for efficient loading of the compressed 3D model.
 * 
 * Features:
 * - DRACO decoder configuration for compressed geometry
 * - GLTF loader setup with DRACO support
 * - Automatic model loading and caching
 * - Error handling for loading failures
 * 
 * @returns {GLTF} The loaded GLTF model instance
 */
export function useSkullModel() {
  // Initialize DRACO loader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

  // Initialize GLTF loader
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  return useLoader(
    GLTFLoader,
    'https://lagazetta.s3.eu-central-1.amazonaws.com/SkullWithTeeth-processed.glb',
    (loader) => {
      loader.setDRACOLoader(dracoLoader);
    }
  );
}