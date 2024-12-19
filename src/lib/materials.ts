import * as THREE from 'three';

/**
 * Creates a transparent material for the skull
 */
export const createSkullMaterial = () => 
  new THREE.MeshStandardMaterial({
    color: 0x90caf9,  // Light Blue 200
    metalness: 0.1,
    roughness: 0.4,
    transparent: true,
    opacity: 0.8,  // Increased default opacity
    envMapIntensity: 0.8,
    side: THREE.DoubleSide,
    emissive: 0xbbdefb,  // Light Blue 100
    emissiveIntensity: 0.15,
    depthWrite: false,  // Ensures proper transparency
  });

/**
 * Creates the default material for tooth meshes
 * 
 * Configures a standard material with properties suitable for
 * the normal state of tooth meshes.
 * 
 * @returns {THREE.MeshStandardMaterial} The configured default material
 */
export const createDefaultMaterial = () => 
  new THREE.MeshStandardMaterial({
    color: 0xffffff,  // Pure white for teeth
    metalness: 0.2,   // Slightly increased for better reflections
    roughness: 0.3,   // Smoother surface for dental appearance
    transparent: false,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
    depthWrite: true,  // Ensure proper depth rendering
  });

/**
 * Creates the highlight material for hovered tooth meshes
 * 
 * Configures a standard material with properties suitable for
 * highlighting teeth on hover, including emissive properties.
 * 
 * @returns {THREE.MeshStandardMaterial} The configured highlight material
 */
export const createHighlightMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: 0xffd700,  // Gold
    metalness: 0.3,
    roughness: 0.2,
    transparent: false,  // Remove transparency
    emissive: 0xffe57f,  // Lighter gold for emissive
    emissiveIntensity: 0.6,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
    depthWrite: true,  // Ensure proper depth rendering
  });