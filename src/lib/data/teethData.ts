interface ToothData {
    number: string;
    name: string;
    status: 'healthy' | 'treated' | 'needs-treatment' | 'monitoring';
    lastTreatment: string;
    history: string[];
    notes: string;
  }
  
  type TeethDataMap = {
    [key: string]: ToothData;
  };
  
  // Bottom Right Quadrant
  const bottomRightTeeth: TeethDataMap = {
    'CentralIncisor': createToothData('41', 'Lower Right Central Incisor'),
    'LateralIncisor': createToothData('42', 'Lower Right Lateral Incisor'),
    'Cupsid': createToothData('43', 'Lower Right Canine'),
    '1stBicuspid': createToothData('44', 'Lower Right First Premolar'),
    '2ndBicuspid': createToothData('45', 'Lower Right Second Premolar'),
    '1stMolar': createToothData('46', 'Lower Right First Molar'),
    '2ndMolar': createToothData('47', 'Lower Right Second Molar'),
    '3rdMolar': createToothData('48', 'Lower Right Third Molar'),
  };
  
  // Bottom Left Quadrant
  const bottomLeftTeeth: TeethDataMap = {
    'CentralIncisor_1': createToothData('31', 'Lower Left Central Incisor'),
    'LateralIncisor_1': createToothData('32', 'Lower Left Lateral Incisor'),
    'Cupsid_1': createToothData('33', 'Lower Left Canine'),
    '1stBicuspid_1': createToothData('34', 'Lower Left First Premolar'),
    '2ndBicuspid_1': createToothData('35', 'Lower Left Second Premolar'),
    '1stMolar_1': createToothData('36', 'Lower Left First Molar'),
    '2ndMolar_1': createToothData('37', 'Lower Left Second Molar'),
    '3rdMolar_1': createToothData('38', 'Lower Left Third Molar'),
  };
  
  // Upper Right Quadrant
  const upperRightTeeth: TeethDataMap = {
    'CentralIncisor_2': createToothData('11', 'Upper Right Central Incisor'),
    'LateralIncisor_2': createToothData('12', 'Upper Right Lateral Incisor'),
    'Cuspid_2': createToothData('13', 'Upper Right Canine'),
    '1stBicuspid_2': createToothData('14', 'Upper Right First Premolar'),
    '2ndBicuspid_2': createToothData('15', 'Upper Right Second Premolar'),
    '1stMolar_2': createToothData('16', 'Upper Right First Molar'),
    '2ndMolar_2': createToothData('17', 'Upper Right Second Molar'),
    '3rdMolar_2': createToothData('18', 'Upper Right Third Molar'),
  };
  
  // Upper Left Quadrant
  const upperLeftTeeth: TeethDataMap = {
    'CentralIncisor_3': createToothData('21', 'Upper Left Central Incisor'),
    'LateralIncisor_3': createToothData('22', 'Upper Left Lateral Incisor'),
    'Cuspid_3': createToothData('23', 'Upper Left Canine'),
    '1stBicuspid_3': createToothData('24', 'Upper Left First Premolar'),
    '2ndBicuspid_3': createToothData('25', 'Upper Left Second Premolar'),
    '1stMolar_3': createToothData('26', 'Upper Left First Molar'),
    '2ndMolar_3': createToothData('27', 'Upper Left Second Molar'),
    '3rdMolar_3': createToothData('28', 'Upper Left Third Molar'),
  };
  
  export const teethData: TeethDataMap = {
    ...bottomRightTeeth,
    ...bottomLeftTeeth,
    ...upperRightTeeth,
    ...upperLeftTeeth
  };
  
  function createToothData(number: string, name: string): ToothData {
    const randomDate = () => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June'];
      return `${months[Math.floor(Math.random() * months.length)]} ${2024}`;
    };
  
    const treatments = [
      'Regular Cleaning',
      'Deep Cleaning',
      'Cavity Filling',
      'Root Canal',
      'Crown Placement',
      'X-Ray Examination'
    ];
  
    return {
      number,
      name,
      status: randomStatus(),
      lastTreatment: `${treatments[Math.floor(Math.random() * treatments.length)]} (${Math.floor(Math.random() * 6) + 1} months ago)`,
      history: [
        `${treatments[Math.floor(Math.random() * treatments.length)]} - ${randomDate()}`,
        `${treatments[Math.floor(Math.random() * treatments.length)]} - ${randomDate()}`,
        `${treatments[Math.floor(Math.random() * treatments.length)]} - ${randomDate()}`
      ],
      notes: generateRandomNotes()
    };
  }
  
  function randomStatus(): ToothData['status'] {
    const statuses: ToothData['status'][] = ['healthy', 'treated', 'needs-treatment', 'monitoring'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
  
  function generateRandomNotes(): string {
    const conditions = [
      'Excellent condition, regular maintenance recommended',
      'Minor sensitivity to cold, monitoring required',
      'Recent treatment healing well, follow-up scheduled',
      'Regular checkups maintaining good oral health',
      'Preventive measures showing positive results'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
  
  export function getToothData(meshName: string): ToothData {
    // Clean up mesh name to match our data structure
    const cleanName = meshName
      .replace(/\s+/g, '')
      .replace(/[()]/g, '')
      .replace(/tooth_/i, '')
      .replace(/_\d+$/, '');
  
    // console.log('Clean name for data lookup:', cleanName);
  
    // Try direct match first
    if (teethData[cleanName]) {
      return teethData[cleanName];
    }
  
    // Try matching without numbers
    const baseNameWithoutNumbers = cleanName.replace(/[0-9]/g, '');
    if (teethData[baseNameWithoutNumbers]) {
      return teethData[baseNameWithoutNumbers];
    }
  
    // Try matching with common variations
    const variations = [
      cleanName,
      `${cleanName}_1`,
      `${cleanName}_2`,
      `${cleanName}_3`,
      baseNameWithoutNumbers
    ];
  
    for (const variant of variations) {
      if (teethData[variant]) {
        // console.log('Found match with variant:', variant);
        return teethData[variant];
      }
    }
  
    // Return default data if no match found
    // console.warn('No tooth data found for:', meshName);
    return createToothData('00', 'Unknown Tooth');
  } 