// Camera and Controls Configuration
export const CAMERA_CONFIG = {
  position: [0, 0, 0.4] as const,
  fov: 45,
  near: 0.1,
  far: 1000,
} as const;

export const CONTROLS_CONFIG = {
  target: [0,0,0] as const,
  minDistance: 0.4,
  maxDistance: 1,
  minPolarAngle: Math.PI / 4,
  maxPolarAngle: Math.PI * 0.75,
  autoRotateSpeed: 1.5,
  dampingFactor: 0.05,
  enableDamping: true,
  enablePan: true,
  enableZoom: true,
  enableRotate: true,
} as const;

export const MODEL_URL = 'https://lagazetta.s3.eu-central-1.amazonaws.com/SkullWithTeeth-processed.glb';

export const MODEL_HIERARCHY = {
  ROOT: '__root__',
  SKELETAL_PARTS: {
    CRANIUM: 'Skeletal_Cranium',
    MANDIBLE: 'Skeletal_Mandible',
  },
  GROUPS: {
    BOTTOM: 'BottomSetOfTeeth',
    TOP: 'TopSetOfTeeth',
  },
  BOTTOM_TEETH: {
    '3rdMolar': '3rdMolar',
    '2ndMolar': '2ndMolar',
    '1stMolar': '1stMolar',
    '2ndBicuspid': '2ndBicuspid',
    '1stBicuspid': '1stBicuspid',
    'Cupsid': 'Cupsid',
    'LateralIncisor': 'LateralIncisor',
    'CentralIncisor': 'CentralIncisor',
    '3rdMolar_1': '3rdMolar_1',
    '2ndMolar_1': '2ndMolar_1',
    '1stMolar_1': '1stMolar_1',
    '2ndBicuspid_1': '2ndBicuspid_1',
    '1stBicuspid_1': '1stBicuspid_1',
    'Cupsid_1': 'Cupsid_1',
    'LateralIncisor_1': 'LateralIncisor_1',
    'CentralIncisor_1': 'CentralIncisor_1',
  },
  TOP_TEETH: {
    '1stBicuspid_2': '1stBicuspid_2',
    '1stMolar_2': '1stMolar_2',
    '2ndBicuspid_2': '2ndBicuspid_2',
    '2ndMolar_2': '2ndMolar_2',
    '3rdMolar_2': '3rdMolar_2',
    'CentralIncisor_2': 'CentralIncisor_2',
    'Cuspid_2': 'Cuspid',
    'LateralIncisor_2': 'LateralIncisor_2',
    '1stBicuspid_3': '1stBicuspid_3',
    '1stMolar_3': '1stMolar_3',
    '2ndBicuspid_3': '2ndBicuspid_3',
    '2ndMolar_3': '2ndMolar_3',
    '3rdMolar_3': '3rdMolar_3',
    'CentralIncisor_3': 'CentralIncisor_3',
    'Cuspid_3': 'Cuspid_1',
    'LateralIncisor_3': 'LateralIncisor_3',
  }
} as const;