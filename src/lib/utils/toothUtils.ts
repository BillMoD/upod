import * as THREE from 'three';
import { MODEL_HIERARCHY } from '../constants';
import { createDefaultMaterial } from '../materials';
import type { ToothInteractionHandlers } from '../hooks/useToothInteraction';
import { teethData, getToothData } from '../data/teethData';

interface ToothStatus {
  number: string;
  status: 'healthy' | 'treated' | 'needs-treatment' | 'unknown';
}

/**
 * Checks if a mesh name corresponds to a tooth
 * 
 * @param {string} name - The mesh name to check
 * @returns {boolean} True if the mesh is a tooth
 */
export function isToothMesh(name: string): boolean {
  if (!name) return false;
  
  // console.log('Checking tooth mesh:', name);
  
  const allTeethNames = [
    ...Object.values(MODEL_HIERARCHY.BOTTOM_TEETH),
    ...Object.values(MODEL_HIERARCHY.TOP_TEETH)
  ];
  
  // Clean up the name first
  const normalizedName = name
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
    .replace(/tooth_/i, '')
    .replace(/_\d+$/, ''); // Remove trailing numbers
    
  // console.log('Normalized name:', normalizedName);
  
  // Do a more lenient match
  return allTeethNames.some(toothName => {
    const normalizedToothName = toothName
      .replace(/\s+/g, '')
      .replace(/[()]/g, '')
      .replace(/tooth_/i, '')
      .replace(/_\d+$/, '');
    
    const isMatch = normalizedName.includes(normalizedToothName) || 
                   normalizedToothName.includes(normalizedName);
    
    if (isMatch) {
      // console.log('Matched:', normalizedName, 'with', normalizedToothName);
    }
    
    return isMatch;
  });
}

/**
 * Checks if a mesh is part of the skull (not teeth)
 */
export function isSkullMesh(name: string): boolean {
  return name === 'Skeletal_Cranium' || name === 'Skeletal_Mandible';
}

/**
 * Gets the parent group name for a tooth
 * 
 * @param {string} name - The tooth mesh name
 * @returns {string | null} The parent group name or null
 */
function getToothGroup(name: string): string | null {
  // Check if it's a bottom tooth
  if (name.includes('(1)') || !name.includes('(')) {
    return 'BottomSetOfTeeth';
  }
  
  // Check if it's a top tooth
  if (name.includes('(2)') || name.includes('(3)')) {
    return 'TopSetOfTeeth';
  }
  
  return null;
}

/**
 * Sets up a tooth mesh with materials and event handlers
 * 
 * @param {THREE.Mesh} mesh - The mesh to setup
 * @param {ToothInteractionHandlers} handlers - Event handlers for the mesh
 */
export function setupToothMesh(
  mesh: THREE.Mesh,
  handlers: ToothInteractionHandlers
): void {
  if (!isToothMesh(mesh.name)) return;
  
  // Store the group information
  const group = getToothGroup(mesh.name);
  mesh.userData.group = group;
  
  // Initialize with default material
  const defaultMaterial = createDefaultMaterial();
  mesh.material = defaultMaterial;

  // Setup interaction properties
  mesh.userData.interactive = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
}

/**
 * Calculates the tooltip position for a tooth mesh
 * 
 * @param {THREE.Mesh} mesh - The mesh to calculate position for
 * @returns {THREE.Vector3} The calculated tooltip position
 */
export function calculateTooltipPosition(mesh: THREE.Mesh): THREE.Vector3 {
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // Add vertical offset based on bounding box size
  // Adjust offset based on tooth position (top/bottom)
  const isTopTooth = mesh.userData.group === MODEL_HIERARCHY.GROUPS.TOP;
  const verticalOffset = size.y * (isTopTooth ? 0.8 : -0.3);
  center.y += verticalOffset;
  
  return center;
}

/**
 * Formats a tooth mesh name for display
 * 
 * Converts technical mesh names into human-readable format,
 * handling special cases and formatting rules.
 * 
 * @param {string} meshName - The mesh name to format
 * @returns {string} The formatted tooth name
 */
export function formatToothName(meshName: string): string {
  // Clean up the mesh name to match data keys
  const cleanName = meshName.replace(/\s+/g, '_');
  
  const data = getToothData(cleanName);
  return data.name || 'Unknown Tooth';
}

interface ToothDetails {
  lastTreatment: string;
  nextCheckup: string;
  history: string[];
}

/**
 * Gets the dental notation number and status for a tooth
 * 
 * @param {string} meshName - Name of the tooth mesh
 * @returns {ToothStatus} Object containing tooth number and status
 */
export function getToothStatus(meshName: string): ToothStatus {
  // Clean up the mesh name to match data keys
  const cleanName = meshName.replace(/\s+/g, '_');
  
  const data = getToothData(cleanName);
  return {
    number: data.number,
    status: data.status || 'unknown'
  };
}

/**
 * Gets detailed information about a tooth's treatment history
 * 
 * @param {string} meshName - Name of the tooth mesh
 * @returns {ToothDetails} Object containing tooth treatment details
 */
export function getToothDetails(meshName: string): ToothDetails {
  // Clean up the mesh name to match data keys
  const cleanName = meshName.replace(/\s+/g, '_');
  
  const data = getToothData(cleanName);
  return {
    lastTreatment: data.lastTreatment || 'No treatment record',
    history: data.history || [],
    notes: data.notes || 'No notes available'
  };
}