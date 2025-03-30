// Define the interface for Medical Facility
export interface MedicalFacility {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'LIMITED' | 'CLOSED';
  services?: string[];
  phone?: string;
  last_updated?: string;
  description?: string;
  type: 'medical';
}

// Export the array of mock medical facilities
export const mockMedicalFacilities: MedicalFacility[] = [
  // Major Hospitals
  {
    id: 1,
    name: 'Owen King EU Hospital (Victoria Hospital)',
    address: 'Hospital Road, Castries', // Assumed address segment
    latitude: 14.0101,
    longitude: -60.9871,
    status: 'OPEN',
    services: ['Main general hospital', 'emergency services', 'specialist care'],
    phone: '+1 (758) 458-6500', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Primary public hospital facility in Castries.',
    type: 'medical'
  },
  {
    id: 2,
    name: 'St. Jude Hospital',
    address: 'St Jude\'s Hwy, Vieux Fort', // Assumed address segment
    latitude: 13.7318,
    longitude: -60.9490,
    status: 'OPEN',
    services: ['General hospital services', 'emergency care'],
    phone: '+1 (758) 454-6041', // Example phone
    last_updated: new Date().toISOString(),
    description: 'General hospital serving the south of the island.',
    type: 'medical'
  },
  {
    id: 3,
    name: 'Tapion Hospital',
    address: 'Tapion Reef, Castries', // Assumed address segment
    latitude: 14.0099,
    longitude: -60.9971,
    status: 'OPEN',
    services: ['Private hospital', 'emergency services', 'specialist care'],
    phone: '+1 (758) 459-2000', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Private hospital facility in Castries.',
    type: 'medical'
  },
  // Health Centers and Polyclinics
  {
    id: 4,
    name: 'Gros Islet Polyclinic',
    address: 'Gros Islet Highway, Gros Islet', // Assumed address segment
    latitude: 14.0865,
    longitude: -60.9455,
    status: 'OPEN',
    services: ['Primary care', 'maternal health'],
    phone: '+1 (758) 450-9616', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Polyclinic providing primary care services.',
    type: 'medical'
  },
  {
    id: 5,
    name: 'Dennery Hospital',
    address: 'Hospital Road, Dennery', // Assumed address segment
    latitude: 13.9300,
    longitude: -60.8800,
    status: 'OPEN',
    services: ['District hospital', 'basic emergency care'],
    phone: '+1 (758) 453-3310', // Example phone
    last_updated: new Date().toISOString(),
    description: 'District hospital providing basic services.',
    type: 'medical'
  },
  {
    id: 6,
    name: 'Soufriere Hospital',
    address: 'Palmiste, Soufriere', // Assumed address segment
    latitude: 13.8566,
    longitude: -61.0564,
    status: 'OPEN',
    services: ['District hospital', 'primary care'],
    phone: '+1 (758) 459-7258', // Example phone
    last_updated: new Date().toISOString(),
    description: 'District hospital providing primary care.',
    type: 'medical'
  },
  {
    id: 7,
    name: 'La Croix Maingot Wellness Centre',
    address: 'La Croix Maingot, Anse La Raye', // Assumed address segment
    latitude: 13.9546,
    longitude: -60.9944,
    status: 'OPEN',
    services: ['Primary care'],
    phone: '+1 (758) 451-4081', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Wellness centre providing primary care.',
    type: 'medical'
  },
  {
    id: 8,
    name: 'Ciceron Wellness Centre',
    address: 'Ciceron, Castries', // Assumed address segment
    latitude: 14.0165,
    longitude: -60.9797,
    status: 'OPEN',
    services: ['Primary care', 'community health'],
    phone: '+1 (758) 452-1307', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Wellness centre providing primary and community health services.',
    type: 'medical'
  },
  {
    id: 9,
    name: 'Mongouge Wellness Centre',
    address: 'Mongouge, Choiseul', // Assumed address segment
    latitude: 13.7769,
    longitude: -61.0498,
    status: 'OPEN',
    services: ['Primary care'],
    phone: '+1 (758) 454-3186', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Wellness centre providing primary care.',
    type: 'medical'
  },
  {
    id: 10,
    name: 'Richfond Wellness Centre',
    address: 'Richfond, Dennery', // Assumed address segment
    latitude: 13.9047,
    longitude: -60.9129,
    status: 'OPEN',
    services: ['Primary care'],
    phone: '+1 (758) 453-0190', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Wellness centre providing primary care.',
    type: 'medical'
  },
  {
    id: 11,
    name: 'Vieux Fort Wellness Centre',
    address: 'Beanfield, Vieux Fort', // Assumed address segment
    latitude: 13.7246,
    longitude: -60.9494,
    status: 'OPEN',
    services: ['Primary care', 'maternal health'],
    phone: '+1 (758) 454-6528', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Wellness centre providing primary and maternal health services.',
    type: 'medical'
  },
  {
    id: 12,
    name: 'Castries Health Centre',
    address: 'Darling Road, Castries', // Assumed address segment
    latitude: 14.0101,
    longitude: -60.9892,
    status: 'OPEN',
    services: ['Primary care', 'family health'],
    phone: '+1 (758) 468-5309', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Health centre providing primary and family health services.',
    type: 'medical'
  },
  // Specialized Facilities
  {
    id: 13,
    name: 'National Mental Wellness Centre',
    address: 'Coubaril, Castries', // Assumed address segment
    latitude: 14.0254,
    longitude: -60.9762,
    status: 'OPEN',
    services: ['Mental health services', 'psychiatric care'],
    phone: '+1 (758) 452-2421', // Example phone
    last_updated: new Date().toISOString(),
    description: 'National centre for mental health services.',
    type: 'medical'
  },
  {
    id: 14,
    name: 'Turning Point Rehabilitation Centre',
    address: 'Millennium Highway, Castries', // Assumed address segment
    latitude: 14.0138,
    longitude: -60.9754,
    status: 'OPEN',
    services: ['Substance abuse treatment', 'rehabilitation'],
    phone: '+1 (758) 458-1729', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Centre for substance abuse treatment and rehabilitation.',
    type: 'medical'
  },
  {
    id: 15,
    name: 'St. Lucia Planned Parenthood Association',
    address: 'Brazil Street, Castries', // Assumed address segment
    latitude: 14.0118,
    longitude: -60.9890,
    status: 'OPEN',
    services: ['Reproductive health', 'family planning'],
    phone: '+1 (758) 452-5458', // Example phone
    last_updated: new Date().toISOString(),
    description: 'Provides reproductive health and family planning services.',
    type: 'medical'
  }
]; 